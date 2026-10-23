import { Component, effect, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AnalyticsService } from "../../../services/analytics.service";
import { GetVisitorCountsApiEndpointResponse, VisitorCounts } from "../../../..";
import { NotificationService } from "../../../services/notification.service";
import { LoadingComponent } from "../../../components/loading/loading.component";

@Component({
    selector: "app-stats-website-analytics",
    imports: [LoadingComponent],
    templateUrl: "./stats-website-analytics.component.html",
    styleUrl: "./stats-website-analytics.component.scss",
})
export class StatsWebsiteAnalyticsComponent implements OnInit, OnDestroy {
    visitorCounts = signal<VisitorCounts[]>([]);

    pageViews = signal<number[]>([]);
    uniqueViews = signal<number[]>([]);
    totalTime = signal<number[]>([]);

    elementReference = inject(ElementRef);

    svgWidth = signal<number>(0);
    svgHeight = signal<number>(0);

    pageViewsGraphPath = signal<string>("");
    uniqueViewsGraphPath = signal<string>("");
    totalTimeGraphPath = signal<string>("");

    pageViewsDataSteps = signal<number[]>([]);
    uniqueViewsDataSteps = signal<number[]>([]);
    totalTimeDataSteps = signal<number[]>([]);

    failedFetching = signal<boolean>(false);

    private platformId = inject(PLATFORM_ID);

    private analyticsService = inject(AnalyticsService);
    private notificationService = inject(NotificationService);

    private _updateValues = effect(() => {
        this.pageViews.set([]);
        this.uniqueViews.set([]);
        this.totalTime.set([]);

        for (const day of this.visitorCounts()) {
            this.pageViews.update((views) => {
                views.push(day.pageviews.value);

                return views;
            });

            this.uniqueViews.update((views) => {
                views.push(day.uniques.value);

                return views;
            });

            this.totalTime.update((times) => {
                times.push(day.totaltime.value);

                return times;
            });
        }

        this.pageViewsGraphPath.set(this.createExponentialPath(this.pageViews()));
        this.uniqueViewsGraphPath.set(this.createExponentialPath(this.uniqueViews()));
        this.totalTimeGraphPath.set(this.createExponentialPath(this.totalTime()));

        this.updateDataSteps();
    });

    private _updateSvgDimensionsInterval: NodeJS.Timeout | undefined = undefined;
    private _updateSvgPathInterval: NodeJS.Timeout | undefined = undefined;

    ngOnInit(): void {
        this.getVisitorCounts(7);

        this.elementReference.nativeElement.addEventListener("resize", this.updateSvgDimensions.bind(this));
        this.elementReference.nativeElement.addEventListener("resize", this.updateSvgPath.bind(this));

        if (!isPlatformBrowser(this.platformId)) {
            console.log("Not running in a browser, skipping SVG dimension and path updates.");

            return;
        }

        this._updateSvgDimensionsInterval = setInterval(this.updateSvgDimensions.bind(this), 1000);
        this._updateSvgPathInterval = setInterval(this.updateSvgPath.bind(this), 1000);
    }

    ngOnDestroy(): void {
        clearInterval(this._updateSvgDimensionsInterval);
        clearInterval(this._updateSvgPathInterval);

        this.elementReference.nativeElement.removeEventListener("resize", this.updateSvgDimensions.bind(this));
        this.elementReference.nativeElement.removeEventListener("resize", this.updateSvgPath.bind(this));
    }

    getVisitorCounts(days: number): void {
        this.visitorCounts.set([]);

        const request = this.analyticsService.getVisitorCounts(days);

        request.subscribe({
            next: (response: GetVisitorCountsApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Die Besucherzahlen konnten nicht geladen werden: " + response.message);

                    this.failedFetching.set(true);

                    return;
                }

                this.visitorCounts.set(response.data);

                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while fetching visitor counts:", error);
                this.notificationService.error("Fehler", "Die Besucherzahlen konnten nicht geladen werden. Bitte versuche es später erneut.");

                this.failedFetching.set(true);
            },
        });
    }

    max(array: number[]): number {
        return Math.max(...array);
    }

    min(array: number[]): number {
        return Math.min(...array);
    }

    createExponentialPath(data: number[]) {
        // How to handle paths:

        // Move to a point with M {x} {y}
        // The pen stays there
        // Then create a curve use C
        // The start of the curve is the current pen position
        // Then there are two control points (The stuff you can move in inkscape for example)
        // And then there is the end of the curve, where the pen will be moved to after drawing the curve

        // So that would then be the start of the new curve segment.

        // The thing to note here is that the curve starts in the direction of the first control point,
        // and then bends so that it arrives along the direction of the second control point.

        // BETTER

        // Follow the first C with a S with stands for smooth curve
        // It extends the first curve in a smooth way
        // You also don't have to specify the first control point since it can calculate that on its own

        const cubicBias = 0.4; // Adjust this value to increase/decrease the curvature

        // Start the path with M for the first point
        let pathData = `M ${this.calculateDataPointCoordinates(0, data).x} ${this.calculateDataPointCoordinates(0, data).y}`;

        // The second point has to be placed with a Curve C
        // Calculate control points for exponential curve
        const previousX = this.calculateDataPointCoordinates(0, data).x;
        const previousY = this.calculateDataPointCoordinates(0, data).y;
        const currentX = this.calculateDataPointCoordinates(1, data).x;
        const currentY = this.calculateDataPointCoordinates(1, data).y;

        // Calculate control points to create exponential curve
        const controlPoint1X = previousX + (currentX - previousX) * cubicBias;
        const controlPoint1Y = previousY - (previousY - currentY) * cubicBias;

        const controlPoint2X = currentX - (currentX - previousX) * cubicBias;
        const controlPoint2Y = currentY + (currentY - previousY) * cubicBias;

        // Add Bezier curve segment
        pathData += ` C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${currentX},${currentY}`;

        for (let i = 2; i < data.length; i++) {
            // Calculate control points for exponential curve
            const previousPoint = this.calculateDataPointCoordinates(i - 1, data);
            const currentPoint = this.calculateDataPointCoordinates(i, data);

            // Calculate control points to create exponential curve
            // Skip control point 1 since it is calculated automatically by the S command
            const controlPoint2X = currentPoint.x - (currentPoint.x - previousPoint.x) * cubicBias;
            const controlPoint2Y = currentPoint.y + (currentPoint.y - previousPoint.y) * cubicBias;

            // Add smooth curve segment
            pathData += ` S ${controlPoint2X},${controlPoint2Y} ${currentPoint.x},${currentPoint.y}`;
        }

        // Close the path

        // Line to the right edge of the SVG at the same height as the last data point
        pathData += ` L ${this.svgWidth() + 10} ${this.calculateDataPointCoordinates(data.length - 1, data).y}`;

        // Line to the bottom right corner of the SVG
        pathData += ` L ${this.svgWidth() + 10} ${this.svgHeight() + 10}`;

        // Line to the bottom left corner of the SVG
        pathData += ` L -10 ${this.svgHeight() + 10}`;

        // Line to the left edge of the SVG at the same height as the first data point
        pathData += ` L -10 ${this.calculateDataPointCoordinates(0, data).y}`;

        // Close the path
        pathData += ` Z`;

        return pathData;
    }

    getSvgWidth(): number {
        const element = this.elementReference.nativeElement.querySelector("svg");

        if (element) {
            return element.clientWidth;
        }

        return -1;
    }

    getSvgHeight(): number {
        const element = this.elementReference.nativeElement.querySelector("svg");

        if (element) {
            return element.clientHeight;
        }

        return -1;
    }

    updateSvgDimensions(): void {
        this.svgWidth.set(this.getSvgWidth());
        this.svgHeight.set(this.getSvgHeight());
    }

    updateSvgPath(): void {
        this.pageViewsGraphPath.set(this.createExponentialPath(this.pageViews()));
        this.uniqueViewsGraphPath.set(this.createExponentialPath(this.uniqueViews()));
        this.totalTimeGraphPath.set(this.createExponentialPath(this.totalTime()));
    }

    calculateDataPointCoordinates(index: number, data: number[]): { x: number; y: number } {
        const svgWidth = this.getSvgWidth();
        const svgHeight = this.getSvgHeight();

        const usableHeight = svgHeight * 0.8; // Use 90% of the SVG height for the graph
        const heightPadding = svgHeight * 0.1; // Padding at the top and bottom of the SVG

        const xSpacing = svgWidth / (data.length - 1); // Calculate spacing based on SVG width and number of data points

        const biggestValue = this.max(data); // This is 100% of the height
        const smallestValue = this.min(data); // This is 0% of the height

        const ySpacing = usableHeight / (biggestValue - smallestValue); // Calculate how many units of data correspond to one pixel in height

        const calculateDataPointY = (value: number): number => {
            // Y-axis gets bigger towards the bottom
            const y = heightPadding + usableHeight - (value - smallestValue) * ySpacing;

            return y;
        };

        const calculateDataPointX = (index: number): number => {
            const x = index * xSpacing;

            return x;
        };

        return {
            x: calculateDataPointX(index),
            y: calculateDataPointY(data[index]),
        };
    }

    calculateDateXDaysAgo(daysAgo: number): string {
        const daysAgoInMilliseconds = daysAgo * 24 * 60 * 60 * 1000;

        const date = new Date(Date.now() - daysAgoInMilliseconds);

        return date.toLocaleDateString("de-CH", {
            day: "numeric",
            month: "numeric",
        });
    }

    updateDataSteps(): void {
        for (const [index, stepsSignal] of [this.pageViewsDataSteps, this.uniqueViewsDataSteps, this.totalTimeDataSteps].entries()) {
            const data = [this.pageViews, this.uniqueViews, this.totalTime];

            stepsSignal.set([]);

            const highestValue = this.max(data[index]());
            const lowestValue = this.min(data[index]());

            let stepSize = 1;

            if (highestValue > 100000) {
                stepSize = 10000;
            } else if (highestValue > 50000) {
                stepSize = 5000;
            } else if (highestValue > 10000) {
                stepSize = 1000;
            } else if (highestValue > 5000) {
                stepSize = 500;
            } else if (highestValue > 1000) {
                stepSize = 100;
            } else if (highestValue > 500) {
                stepSize = 50;
            } else if (highestValue > 100) {
                stepSize = 25;
            } else if (highestValue > 10) {
                stepSize = 10;
            }

            stepsSignal.update((steps) => {
                for (let i = lowestValue; i < highestValue; i += stepSize) {
                    steps.push(i);
                }

                steps.push(highestValue);

                return steps;
            });
        }
    }

    loadMoreDataPoints(event: Event): void {
        event.preventDefault();

        const currentDataPointsCount = this.visitorCounts().length;

        this.getVisitorCounts(currentDataPointsCount + 7);
    }
}
