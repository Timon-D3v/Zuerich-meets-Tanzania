import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BlogDeleteBlogComponent } from "./blog-delete-blog.component";

describe("BlogDeleteBlogComponent", () => {
    let component: BlogDeleteBlogComponent;
    let fixture: ComponentFixture<BlogDeleteBlogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlogDeleteBlogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BlogDeleteBlogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
