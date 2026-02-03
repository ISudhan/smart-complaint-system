import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    FileText,
    User,
    Calendar,
    AlertTriangle,
    ArrowLeft,
    MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { complaintService } from "@/services/complaintService";
import { authService } from "@/services/authService";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

export default function StaffComplaintDetailPage() {
    const { complaintId } = useParams();
    const { toast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [staff, setStaff] = useState(null);
    const [formData, setFormData] = useState({
        status: "",
        adminRemarks: "",
    });

    useEffect(() => {
        loadComplaint();
        loadStaff();
    }, [complaintId]);

    const loadStaff = async () => {
        const currentStaff = await authService.getCurrentUser();
        setStaff(currentStaff);
    };

    const loadComplaint = async () => {
        try {
            const data = await complaintService.getComplaintById(complaintId);
            setComplaint(data);
            setFormData({
                status: data.status,
                adminRemarks: data.adminRemarks || "",
            });
        } catch (e) {
            console.error("Failed to load complaint:", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load complaint details",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        setIsUpdating(true);
        try {
            await complaintService.updateComplaintStatus(complaintId, {
                status: formData.status,
                adminRemarks: formData.adminRemarks,
                updatedBy: staff?.name || "Staff",
            });

            toast({
                title: "Success",
                description: "Complaint updated successfully",
            });

            loadComplaint();
        } catch (e) {
            console.error("Failed to update:", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update complaint",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-muted-foreground">Loading complaint...</div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-destructive" />
                <p className="text-destructive">Complaint not found</p>
                <Link to="/staff/complaints" className="mt-4 inline-block">
                    <Button variant="outline">Back to Complaints</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Back Button */}
            <Link to="/staff/complaints">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Complaints
                </Button>
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">
                        Complaint #{complaint.complaintId}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(complaint.createdAt).toLocaleString()}
                        </span>
                        <span className="capitalize">{complaint.category}</span>
                    </div>
                </div>
                <StatusBadge status={complaint.status} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Complaint Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Complaint Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Complaint Text</Label>
                                <p className="mt-1 text-sm leading-relaxed">{complaint.complaintText}</p>
                            </div>

                            {!complaint.isAnonymous && complaint.identity && (
                                <div className="pt-4 border-t">
                                    <Label className="text-muted-foreground mb-2 block">Submitted By</Label>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name:</span>{" "}
                                            <span className="font-medium">{complaint.identity.fullName}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Roll No:</span>{" "}
                                            <span className="font-medium">{complaint.identity.rollNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Department:</span>{" "}
                                            <span className="font-medium">{complaint.identity.department}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Contact:</span>{" "}
                                            <span className="font-medium">{complaint.identity.contact}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Update Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Complaint</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks / Notes</Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Add your remarks or resolution notes..."
                                    value={formData.adminRemarks}
                                    onChange={(e) =>
                                        setFormData({ ...formData, adminRemarks: e.target.value })
                                    }
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleUpdateStatus}
                                disabled={isUpdating}
                                className="w-full"
                            >
                                {isUpdating ? "Updating..." : "Update Complaint"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* ML Analysis */}
                    {complaint.mlOutput && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">AI Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {complaint.mlOutput.priority && (
                                    <div>
                                        <Label className="text-muted-foreground">Priority</Label>
                                        <p
                                            className={`font-semibold mt-1 ${complaint.mlOutput.priority === "critical"
                                                    ? "text-red-600"
                                                    : complaint.mlOutput.priority === "high"
                                                        ? "text-orange-600"
                                                        : complaint.mlOutput.priority === "medium"
                                                            ? "text-yellow-600"
                                                            : "text-blue-600"
                                                }`}
                                        >
                                            {complaint.mlOutput.priority.toUpperCase()}
                                        </p>
                                    </div>
                                )}

                                {complaint.mlOutput.sentiment && (
                                    <div>
                                        <Label className="text-muted-foreground">Sentiment</Label>
                                        <p className="mt-1 capitalize">{complaint.mlOutput.sentiment}</p>
                                    </div>
                                )}

                                {complaint.mlOutput.keywords && complaint.mlOutput.keywords.length > 0 && (
                                    <div>
                                        <Label className="text-muted-foreground">Keywords</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {complaint.mlOutput.keywords.map((kw, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-muted text-xs rounded"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Remarks */}
                    {complaint.adminRemarks && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Previous Remarks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {complaint.adminRemarks}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
