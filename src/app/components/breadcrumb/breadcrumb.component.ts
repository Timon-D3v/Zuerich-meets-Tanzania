import { Component, input, output } from "@angular/core";
import { LocalFolder } from "../../..";

@Component({
    imports: [],
    selector: "app-breadcrumb",
    styleUrl: "./breadcrumb.component.scss",
    templateUrl: "./breadcrumb.component.html",
})
export class BreadcrumbComponent {
    folder = input.required<LocalFolder | null>();

    parentFolder = input.required<LocalFolder | null>();

    folderChange = output<number>();

    changeFolder(folderId: number): void {
        this.folderChange.emit(folderId);
    }
}
