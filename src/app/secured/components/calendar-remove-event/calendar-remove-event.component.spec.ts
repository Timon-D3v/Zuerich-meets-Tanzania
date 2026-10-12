import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CalendarRemoveEventComponent } from "./calendar-remove-event.component";

describe("CalendarRemoveEventComponent", () => {
    let component: CalendarRemoveEventComponent;
    let fixture: ComponentFixture<CalendarRemoveEventComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CalendarRemoveEventComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CalendarRemoveEventComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
