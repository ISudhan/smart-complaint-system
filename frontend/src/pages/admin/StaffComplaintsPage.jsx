import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, FileText, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { staffService } from "@/services/staffService";

export default function StaffComplaintsPage() {
    const { staffId } = useParams();
    const [staff, setStaff] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStaffData();
    }, [staffId]);

    const loadStaffData = async () => {
        try {
            setIsLoading(true);
            const [staffData, complaintsData] = await Promise.all([
                staffService.getStaffById(staffId),
                staffService.getStaffComplaints(staffId),
            ]);
            setStaff(staffData);
            setComplaints(complaintsData);
        } catch (error) {
            console.error("Failed to load staff data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">Staff member not found</p>
                <Link to="/admin/staff">
                    <Button variant="link">Back to Staff Management</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/staff">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{staff.name}'s Complaints</h1>
                    <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Assigned</p>
                                <p className="text-2xl font-bold">{complaints.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-info/10">
                                <Users className="h-6 w-6 text-info" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Cases</p>
                                <p className="text-2xl font-bold">
                                    {complaints.filter((c) => c.status !== "resolved" && c.status !== "rejected").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-success/10">
                                <FileText className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Resolved</p>
                                <p className="text-2xl font-bold">
                                    {complaints.filter((c) => c.status === "resolved").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Complaints List */}
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                    {complaints.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No complaints assigned yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {complaints.map((complaint) => (
                                <Link
                                    key={complaint.complaintId}
                                    to={`/admin/complaints/${complaint.complaintId}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-sm font-semibold">
                                                    {complaint.complaintId}
                                                </span>
                                                <StatusBadge status={complaint.status} />
                                                {complaint.mlOutput?.priority && (
                                                    <PriorityBadge priority={complaint.mlOutput.priority} />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <span className="capitalize">{complaint.category}</span>
                                                    {complaint.category === "safety" && (
                                                        <Shield className="h-3.5 w-3.5 text-warning" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {complaint.mlOutput?.priority === "critical" ||
                                                        complaint.mlOutput?.priority === "high" ? (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                                    ) : null}
                                                </div>
                                                <span>{formatDate(complaint.createdAt)}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View Details →
                                        </Button>
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
