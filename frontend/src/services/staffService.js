const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const staffService = {
    // Create new staff member
    async createStaff(staffData) {
        const response = await fetch(`${API_URL}/staff`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify(staffData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create staff member");
        }

        return response.json();
    },

    // Get all staff members
    async getAllStaff() {
        const response = await fetch(`${API_URL}/staff`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch staff members");
        }

        return response.json();
    },

    // Get single staff member
    async getStaffById(staffId) {
        const response = await fetch(`${API_URL}/staff/${staffId}`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch staff member");
        }

        return response.json();
    },

    // Update staff member
    async updateStaff(staffId, updates) {
        const response = await fetch(`${API_URL}/staff/${staffId}`, {
            method: "PUT",
            headers: getAuthHeader(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update staff member");
        }

        return response.json();
    },

    // Delete staff member
    async deleteStaff(staffId) {
        const response = await fetch(`${API_URL}/staff/${staffId}`, {
            method: "DELETE",
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to delete staff member");
        }

        return response.json();
    },

    // Assign complaint to staff
    async assignComplaint(complaintId, staffId) {
        const response = await fetch(`${API_URL}/staff/assign`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ complaintId, staffId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to assign complaint");
        }

        return response.json();
    },

    // Unassign complaint
    async unassignComplaint(complaintId) {
        const response = await fetch(`${API_URL}/staff/unassign`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ complaintId }),
        });

        if (!response.ok) {
            throw new Error("Failed to unassign complaint");
        }

        return response.json();
    },

    // Get staff's assigned complaints
    async getStaffComplaints(staffId) {
        const response = await fetch(`${API_URL}/staff/${staffId}/complaints`, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch staff complaints");
        }

        return response.json();
    },

    // Get suitable staff for a complaint category
    async getSuitableStaff(category) {
        const url = category
            ? `${API_URL}/staff/suitable?category=${category}`
            : `${API_URL}/staff/suitable`;

        const response = await fetch(url, {
            headers: getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch suitable staff");
        }

        return response.json();
    },
};
