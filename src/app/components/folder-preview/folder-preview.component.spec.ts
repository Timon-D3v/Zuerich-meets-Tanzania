import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FolderPreviewComponent } from "./folder-preview.component";

describe("FolderPreviewComponent", () => {
    let component: FolderPreviewComponent;
    let fixture: ComponentFixture<FolderPreviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FolderPreviewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FolderPreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
