import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    assignComplaint,
    unassignComplaint,
    getStaffComplaints,
    getSuitableStaff,
} from "../controllers/staff.controller.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(allowRoles("admin"));

// Staff CRUD
router.post("/", createStaff);
router.get("/", getAllStaff);
router.get("/suitable", getSuitableStaff); // Must be before /:id
router.get("/:id", getStaffById);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

// Assignment operations
router.post("/assign", assignComplaint);
router.post("/unassign", unassignComplaint);
router.get("/:id/complaints", getStaffComplaints);

export default router;
