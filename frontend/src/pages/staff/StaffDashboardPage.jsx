import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle,
    User,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { complaintService } from "@/services/complaintService";
import { authService } from "@/services/authService";
import { StatusBadge } from "@/components/StatusBadge";

export default function StaffDashboardPage() {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [staff, setStaff] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentStaff = await authService.getCurrentUser();
            setStaff(currentStaff);

            // Fetch all complaints and filter by assigned staff
            const allComplaints = await complaintService.getAllComplaints();
            const myComplaints = allComplaints.filter(
                (c) => c.assignedTo?._id === currentStaff.id || c.assignedTo === currentStaff.id
            );
            setComplaints(myComplaints);
        } catch (e) {
            console.error("Failed to load data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-20 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const metrics = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "submitted" || c.status === "in_review").length,
        resolved: complaints.filter((c) => c.status === "resolved").length,
        highPriority: complaints.filter(
            (c) => c.mlOutput?.priority === "high" || c.mlOutput?.priority === "critical"
        ).length,
    };

    const statCards = [
        {
            title: "Total Assigned",
            value: metrics.total,
            icon: FileText,
            iconColor: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Pending Action",
            value: metrics.pending,
            icon: Clock,
            iconColor: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Resolved",
            value: metrics.resolved,
            icon: CheckCircle,
            iconColor: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "High Priority",
            value: metrics.highPriority,
            icon: AlertTriangle,
            iconColor: "text-red-600",
            bgColor: "bg-red-50",
        },
    ];

    const recentComplaints = complaints
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {staff?.name}!</h1>
                    <p className="text-muted-foreground mt-1">
                        Here's an overview of your assigned complaints
                    </p>
                </div>
                <Link to="/staff/complaints">
                    <Button>
                        <FileText className="mr-2 h-4 w-4" />
                        View All
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Specializations */}
            {staff?.specializations && staff.specializations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Your Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {staff.specializations.map((spec) => (
                                <span
                                    key={spec}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                >
                                    {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Complaints */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Complaints</CardTitle>
                        <Link to="/staff/complaints">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentComplaints.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No complaints assigned yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentComplaints.map((complaint) => (
                                <Link
                                    key={complaint._id}
                                    to={`/staff/complaints/${complaint._id}`}
                                    className="block"
                                >
                                    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        #{complaint.complaintId}
                                                    </span>
                                                    <StatusBadge status={complaint.status} />
                                                    {complaint.mlOutput?.priority && (
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${complaint.mlOutput.priority === "critical"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : complaint.mlOutput.priority === "high"
                                                                        ? "bg-orange-100 text-orange-700"
                                                                        : complaint.mlOutput.priority === "medium"
                                                                            ? "bg-yellow-100 text-yellow-700"
                                                                            : "bg-blue-100 text-blue-700"
                                                                }`}
                                                        >
                                                            {complaint.mlOutput.priority.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm line-clamp-2 mb-2">
                                                    {complaint.complaintText}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {complaint.isAnonymous ? "Anonymous" : complaint.identity?.fullName}
                                                    </span>
                                                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                    <span className="capitalize">{complaint.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
