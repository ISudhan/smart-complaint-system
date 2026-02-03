import Admin from "../models/Admin.model.js";
import Staff from "../models/Staff.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2️⃣ Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3️⃣ Create JWT
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 4️⃣ Success
        res.json({
            success: true,
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Find staff
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2️⃣ Check if staff is active
        if (staff.status !== "active") {
            return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
        }

        // 3️⃣ Compare password
        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4️⃣ Create JWT
        const token = jwt.sign(
            { id: staff._id, role: staff.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 5️⃣ Success
        res.json({
            success: true,
            token,
            user: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                specializations: staff.specializations,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
