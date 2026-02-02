import Staff from "../models/Staff.model.js";
import Complaint from "../models/Complaint.model.js";
import bcrypt from "bcryptjs";

// Create new staff member
export const createStaff = async (req, res) => {
    try {
        const { name, email, password, specializations } = req.body;

        // Check if staff already exists
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Staff member already exists with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create staff
        const staff = await Staff.create({
            name,
            email,
            password: hashedPassword,
            specializations: specializations || [],
        });

        res.status(201).json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            specializations: staff.specializations,
            status: staff.status,
            role: staff.role,
        });
    } catch (error) {
        console.error("Error creating staff:", error);
        res.status(500).json({ message: "Failed to create staff member" });
    }
};

// Get all staff members
export const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find()
            .select("-password")
            .populate("assignedComplaints", "complaintId category status priority");

        // Calculate workload for each staff
        const staffWithWorkload = staff.map((member) => ({
            ...member.toObject(),
            activeComplaints: member.assignedComplaints.filter(
                (c) => c.status !== "resolved" && c.status !== "rejected"
            ).length,
            totalAssigned: member.assignedComplaints.length,
        }));

        res.json(staffWithWorkload);
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ message: "Failed to fetch staff members" });
    }
};

// Get single staff member
export const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id)
            .select("-password")
            .populate("assignedComplaints");

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        res.json(staff);
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ message: "Failed to fetch staff member" });
    }
};

// Update staff member
export const updateStaff = async (req, res) => {
    try {
        const { name, email, specializations, status, password } = req.body;

        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Update fields
        if (name) staff.name = name;
        if (email) staff.email = email;
        if (specializations) staff.specializations = specializations;
        if (status) staff.status = status;

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            staff.password = await bcrypt.hash(password, salt);
        }

        await staff.save();

        res.json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            specializations: staff.specializations,
            status: staff.status,
            role: staff.role,
        });
    } catch (error) {
        console.error("Error updating staff:", error);
        res.status(500).json({ message: "Failed to update staff member" });
    }
};

// Delete staff member
export const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Unassign all complaints
        await Complaint.updateMany(
            { assignedTo: staff._id },
            { $unset: { assignedTo: "", assignedAt: "" } }
        );

        await Staff.findByIdAndDelete(req.params.id);

        res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
        console.error("Error deleting staff:", error);
        res.status(500).json({ message: "Failed to delete staff member" });
    }
};

// Assign complaint to staff
export const assignComplaint = async (req, res) => {
    try {
        const { complaintId, staffId } = req.body;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Check if staff is active
        if (staff.status !== "active") {
            return res.status(400).json({ message: "Cannot assign to inactive staff member" });
        }

        // Check if staff has specialization for this category
        if (staff.specializations.length > 0 && !staff.specializations.includes(complaint.category)) {
            return res.status(400).json({
                message: `Staff member is not specialized in ${complaint.category} complaints`,
            });
        }

        // Remove from previous staff's list if exists
        if (complaint.assignedTo) {
            await Staff.findByIdAndUpdate(complaint.assignedTo, {
                $pull: { assignedComplaints: complaint._id },
            });
        }

        // Assign complaint
        complaint.assignedTo = staff._id;
        complaint.assignedAt = new Date();
        complaint.assignedBy = req.user._id;

        // Add to audit log
        complaint.auditLog.push({
            timestamp: new Date(),
            action: "assigned",
            performedBy: req.user.email,
            details: `Assigned to ${staff.name} (${staff.email})`,
        });

        await complaint.save();

        // Add to staff's assigned complaints
        if (!staff.assignedComplaints.includes(complaint._id)) {
            staff.assignedComplaints.push(complaint._id);
            await staff.save();
        }

        res.json({
            message: "Complaint assigned successfully",
            complaint: await Complaint.findById(complaintId).populate("assignedTo", "-password"),
        });
    } catch (error) {
        console.error("Error assigning complaint:", error);
        res.status(500).json({ message: "Failed to assign complaint" });
    }
};

// Unassign complaint
export const unassignComplaint = async (req, res) => {
    try {
        const { complaintId } = req.body;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (!complaint.assignedTo) {
            return res.status(400).json({ message: "Complaint is not assigned" });
        }

        // Remove from staff's list
        await Staff.findByIdAndUpdate(complaint.assignedTo, {
            $pull: { assignedComplaints: complaint._id },
        });

        // Add to audit log
        complaint.auditLog.push({
            timestamp: new Date(),
            action: "unassigned",
            performedBy: req.user.email,
            details: "Complaint unassigned",
        });

        complaint.assignedTo = undefined;
        complaint.assignedAt = undefined;
        await complaint.save();

        res.json({ message: "Complaint unassigned successfully" });
    } catch (error) {
        console.error("Error unassigning complaint:", error);
        res.status(500).json({ message: "Failed to unassign complaint" });
    }
};

// Get staff's assigned complaints
export const getStaffComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ assignedTo: req.params.id }).populate(
            "assignedTo assignedBy",
            "-password"
        );

        res.json(complaints);
    } catch (error) {
        console.error("Error fetching staff complaints:", error);
        res.status(500).json({ message: "Failed to fetch complaints" });
    }
};

// Get staff suitable for a complaint
export const getSuitableStaff = async (req, res) => {
    try {
        const { category } = req.query;

        const query = { status: "active" };

        // If category specified, find staff with matching specialization or no specialization
        if (category) {
            query.$or = [
                { specializations: category },
                { specializations: { $size: 0 } }, // Staff with no specialization can handle any
            ];
        }

        const staff = await Staff.find(query)
            .select("-password")
            .populate("assignedComplaints", "status");

        // Calculate workload for each
        const staffWithWorkload = staff.map((member) => ({
            ...member.toObject(),
            activeComplaints: member.assignedComplaints.filter(
                (c) => c.status !== "resolved" && c.status !== "rejected"
            ).length,
        }));

        // Sort by workload (least busy first)
        staffWithWorkload.sort((a, b) => a.activeComplaints - b.activeComplaints);

        res.json(staffWithWorkload);
    } catch (error) {
        console.error("Error fetching suitable staff:", error);
        res.status(500).json({ message: "Failed to fetch suitable staff" });
    }
};
