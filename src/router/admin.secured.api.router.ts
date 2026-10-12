import { Router } from "express";

import adminTeamRouter from "./team.admin.secured.api.router";
import adminNewsRouter from "./news.admin.secured.api.router";
import adminBlogRouter from "./blog.admin.secured.api.router";
import adminFilesRouter from "./files.admin.secured.api.router";
import adminGalleryRouter from "./gallery.admin.secured.api.router";
import adminCalendarRouter from "./calendar.admin.secured.api.router";
import adminDonationRouter from "./donation.admin.secured.api.router";
import adminSubpagesRouter from "./subpages.admin.secured.api.router";
import adminAnalyticsRouter from "./analytics.admin.secured.api.router";
import adminManagementRouter from "./management.admin.secured.api.router";
import adminMembershipRouter from "./membership.admin.secured.api.router";

// Router Serves under /api/secured/admin
// To access apis under this router, authentication with admin privilege is required
const router = Router();

router.use("/team", adminTeamRouter);
router.use("/news", adminNewsRouter);
router.use("/blog", adminBlogRouter);
router.use("/files", adminFilesRouter);
router.use("/gallery", adminGalleryRouter);
router.use("/calendar", adminCalendarRouter);
router.use("/donation", adminDonationRouter);
router.use("/subpages", adminSubpagesRouter);
router.use("/analytics", adminAnalyticsRouter);
router.use("/management", adminManagementRouter);
router.use("/membership", adminMembershipRouter);

export default router;
