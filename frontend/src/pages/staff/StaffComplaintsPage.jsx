import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    User,
    Calendar,
    Search,
    Filter,
    ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function StaffComplaintsPage() {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [staff, setStaff] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [complaints, searchTerm, statusFilter, priorityFilter]);

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
            console.error("Failed to load complaints:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const filterComplaints = () => {
        let filtered = [...complaints];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (c) =>
                    c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.complaintText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((c) => c.status === statusFilter);
        }

        // Priority filter
        if (priorityFilter !== "all") {
            filtered = filtered.filter((c) => c.mlOutput?.priority === priorityFilter);
        }

        setFilteredComplaints(filtered);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">My Complaints</h1>
                <Card className="animate-pulse">
                    <CardContent className="p-12">
                        <div className="h-64 bg-muted rounded" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Complaints</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your assigned complaints
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total: {filteredComplaints.length} / {complaints.length}
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search complaints..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="in_review">In Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Priority Filter */}
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Complaints List */}
            <Card>
                <CardHeader>
                    <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredComplaints.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">
                                {complaints.length === 0
                                    ? "No complaints assigned yet"
                                    : "No complaints match your filters"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredComplaints.map((complaint) => (
                                <Link
                                    key={complaint._id}
                                    to={`/staff/complaints/${complaint._id}`}
                                    className="block"
                                >
                                    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="font-mono text-sm font-semibold">
                                                        #{complaint.complaintId}
                                                    </span>
                                                    <StatusBadge status={complaint.status} />
                                                    {complaint.mlOutput?.priority && (
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${complaint.mlOutput.priority === "critical"
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
                                                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize">
                                                        {complaint.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm line-clamp-2 mb-2">
                                                    {complaint.complaintText}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {complaint.isAnonymous
                                                            ? "Anonymous"
                                                            : complaint.identity?.fullName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </span>
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
