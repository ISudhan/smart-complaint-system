import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "staff" },
        specializations: {
            type: [String],
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
            default: [],
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        assignedComplaints: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Complaint",
            },
        ],
    },
    { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
