import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        complaintId: { type: String, required: true, unique: true },

        isAnonymous: { type: Boolean, default: true },

        identity: {
            fullName: String,
            rollNumber: String,
            department: String,
            contact: String,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "academic",
                "hostel",
                "infrastructure",
                "safety",
                "harassment",
                "financial",
                "transport",
                "library",
                "administrative",
                "other",
            ],
        },

        complaintText: { type: String, required: true },

        status: {
            type: String,
            default: "submitted",
            enum: ["submitted", "in_review", "resolved", "rejected"],
        },

        adminRemarks: String,

        files: [String],

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
        },

        assignedAt: Date,

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },

        mlOutput: {
            category: String,
            priority: {
                type: String,
                enum: ["low", "medium", "high", "critical"],
                default: "medium",
            },
            sentiment: String,
            keywords: [String],
            flags: {
                urgent: { type: Boolean, default: false },
                safety: { type: Boolean, default: false },
                duplicate: { type: Boolean, default: false },
            },
            confidence: { type: Number, default: 0.8 },
        },

        auditLog: [
            {
                timestamp: Date,
                action: String,
                performedBy: String,
                details: String,
            },
        ],

        updatedBy: String,
    },
    { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
