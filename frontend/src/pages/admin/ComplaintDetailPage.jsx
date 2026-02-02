import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserX,
  User,
  AlertTriangle,
  Shield,
  Clock,
  Loader2,
  Save,
  Copy,
  Smile,
  Meh,
  Frown,
  Zap,
  UserCog,
  CheckCircle,
  XCircle as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { complaintService } from "@/services/complaintService";
import { authService } from "@/services/authService";
import { staffService } from "@/services/staffService";
import { useToast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export default function ComplaintDetailPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("submitted");
  const [remarks, setRemarks] = useState("");
  const [copied, setCopied] = useState(false);

  const [suitableStaff, setSuitableStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (complaintId) {
      loadComplaint();
    }
  }, [complaintId]);

  useEffect(() => {
    if (complaint?.category) {
      loadSuitableStaff();
    }
  }, [complaint?.category]);

  const loadComplaint = async () => {
    try {
      const data = await complaintService.getComplaint(complaintId);
      if (data) {
        setComplaint(data);
        setNewStatus(data.status);
        setRemarks(data.adminRemarks || "");
        if (data.assignedTo) {
          setSelectedStaff(data.assignedTo._id || data.assignedTo);
        }
      } else {
        navigate("/admin/complaints");
      }
    } catch (error) {
      console.error("Failed to load complaint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuitableStaff = async () => {
    try {
      const staff = await staffService.getSuitableStaff(complaint.category);
      setSuitableStaff(staff);
    } catch (error) {
      console.error("Failed to load staff:", error);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff) return;

    setIsAssigning(true);
    try {
      await staffService.assignComplaint(complaint._id, selectedStaff);
      toast({
        title: "Success",
        description: "Complaint assigned successfully",
      });
      await loadComplaint();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignStaff = async () => {
    setIsAssigning(true);
    try {
      await staffService.unassignComplaint(complaint._id);
      toast({
        title: "Success",
        description: "Complaint unassigned successfully",
      });
      setSelectedStaff("");
      await loadComplaint();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSave = async () => {
    if (!complaint) return;

    setIsSaving(true);
    try {
      const admin = await authService.getCurrentAdmin();
      const success = await complaintService.updateComplaintStatus(
        complaint.complaintId,
        {
          status: newStatus,
          adminRemarks: remarks,
          updatedBy: admin?.name,
        }
      );

      if (success) {
        await loadComplaint();
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (complaint) {
      await navigator.clipboard.writeText(complaint.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Complaint not found</p>
        <Link to="/admin/complaints">
          <Button variant="link">Back to list</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/complaints">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono">{complaint.complaintId}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              <Copy className={`h-3.5 w-3.5 ${copied ? "text-success" : ""}`} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted on {formatDate(complaint.createdAt)}
          </p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.category && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="capitalize font-medium">
                    {complaint.category}
                  </span>
                  {complaint.category === "safety" && (
                    <Shield className="h-4 w-4 text-warning" />
                  )}
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {complaint.complaintText}
                </p>
              </div>

              {complaint.files && complaint.files.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Attachments:
                  </p>
                  <ul className="text-sm space-y-1">
                    {complaint.files.map((file, index) => (
                      <li
                        key={index}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Identity (if provided) */}
          {!complaint.isAnonymous && complaint.identity && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    Complainant Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{complaint.identity.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">
                      {complaint.identity.rollNumber}
                    </p>
                  </div>
                  {complaint.identity.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">
                        {complaint.identity.department}
                      </p>
                    </div>
                  )}
                  {complaint.identity.contact && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{complaint.identity.contact}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {complaint.isAnonymous && (
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <UserX className="h-5 w-5" />
                  <span className="text-sm">
                    This is an anonymous complaint. No identity information
                    available.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ML Output */}
          {complaint.mlOutput && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  AI Analysis & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Metrics Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Priority */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Priority Level
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {(complaint.mlOutput.priority === "high" ||
                        complaint.mlOutput.priority === "critical") && (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                      {complaint.mlOutput.priority === "medium" && (
                        <Zap className="h-5 w-5 text-warning" />
                      )}
                      {complaint.mlOutput.priority === "low" && (
                        <Zap className="h-5 w-5 text-success" />
                      )}
                      <span className="font-bold text-lg capitalize">
                        {complaint.mlOutput.priority}
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Analysis Confidence
                    </p>
                    <p className="font-bold text-lg mt-2">
                      {Math.round(complaint.mlOutput.confidence * 100)}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-secondary transition-all"
                        style={{
                          width: `${complaint.mlOutput.confidence * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Sentiment
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {complaint.mlOutput.sentiment === "positive" && (
                        <Smile className="h-5 w-5 text-success" />
                      )}
                      {complaint.mlOutput.sentiment === "negative" && (
                        <Frown className="h-5 w-5 text-destructive" />
                      )}
                      {complaint.mlOutput.sentiment === "neutral" && (
                        <Meh className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-bold capitalize">
                        {complaint.mlOutput.sentiment}
                      </span>
                    </div>
                    {complaint.mlOutput.sentimentScore !== undefined && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Score: {complaint.mlOutput.sentimentScore}
                      </div>
                    )}
                  </div>

                  {/* Category Detection */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-info/10 to-info/5 border border-info/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Detected Category
                    </p>
                    <p className="font-bold capitalize mt-2">
                      {complaint.mlOutput.category || complaint.category || "Other"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Flags Section */}
                <div>
                  <p className="text-sm font-semibold mb-3">Alert Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {complaint.mlOutput.flags.urgent && (
                      <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full font-medium text-xs flex items-center gap-1 border border-destructive/30">
                        <AlertTriangle className="h-3 w-3" />
                        Urgent
                      </span>
                    )}
                    {complaint.mlOutput.flags.safety && (
                      <span className="px-3 py-1 bg-warning/20 text-warning rounded-full font-medium text-xs flex items-center gap-1 border border-warning/30">
                        <Shield className="h-3 w-3" />
                        Safety Related
                      </span>
                    )}
                    {complaint.mlOutput.flags.duplicate && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full font-medium text-xs border border-muted-foreground/30">
                        ⚠️ Possible Duplicate
                      </span>
                    )}
                    {!complaint.mlOutput.flags.urgent &&
                      !complaint.mlOutput.flags.safety &&
                      !complaint.mlOutput.flags.duplicate && (
                        <span className="text-sm text-muted-foreground italic">
                          ✓ No critical flags detected
                        </span>
                      )}
                  </div>
                </div>

                {/* Keywords Section */}
                {complaint.mlOutput.keywords &&
                  complaint.mlOutput.keywords.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold mb-3">
                          Extracted Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {complaint.mlOutput.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary/15 text-primary rounded-lg text-xs font-medium border border-primary/30"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Staff Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.assignedTo ? (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Assigned to:</span>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="font-semibold">
                      {complaint.assignedTo.name || "Unknown Staff"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {complaint.assignedTo.email || ""}
                    </p>
                    {complaint.assignedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned on {formatDate(complaint.assignedAt)}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleUnassignStaff}
                    disabled={isAssigning}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Unassigning...
                      </>
                    ) : (
                      <>
                        <XIcon className="h-4 w-4 mr-2" />
                        Unassign
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      Not assigned to any staff member
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign to Staff</Label>
                    <p className="text-xs text-muted-foreground">
                      Showing staff specialized in <span className="font-semibold capitalize">{complaint.category}</span> complaints
                    </p>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          suitableStaff.length === 0
                            ? "No suitable staff available"
                            : "Select staff member..."
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {suitableStaff.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No staff members specialized in {complaint.category}
                          </div>
                        ) : (
                          suitableStaff.map((staff) => (
                            <SelectItem key={staff._id} value={staff._id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{staff.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({staff.activeComplaints || 0} active)
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignStaff}
                    disabled={!selectedStaff || isAssigning || suitableStaff.length === 0}
                    className="w-full"
                    size="sm"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserCog className="h-4 w-4 mr-2" />
                        Assign Staff
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Remarks</Label>
                <Textarea
                  placeholder="Add notes or remarks..."
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Audit Log */}
          {complaint.auditLog && complaint.auditLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaint.auditLog.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.performedBy} •{" "}
                          {formatDate(entry.timestamp)}
                        </p>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
