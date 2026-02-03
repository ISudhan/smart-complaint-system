import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    UserPlus,
    Trash2,
    Edit,
    Mail,
    CheckCircle,
    XCircle,
    Briefcase,
    FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { staffService } from "@/services/staffService";
import { useToast } from "@/hooks/use-toast";

const COMPLAINT_CATEGORIES = [
    { value: "academic", label: "Academic" },
    { value: "hostel", label: "Hostel" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "safety", label: "Safety" },
    { value: "harassment", label: "Harassment" },
    { value: "financial", label: "Financial" },
    { value: "transport", label: "Transport" },
    { value: "library", label: "Library" },
    { value: "administrative", label: "Administrative" },
    { value: "other", label: "Other" },
];

export default function StaffManagementPage() {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deleteStaffId, setDeleteStaffId] = useState(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        specializations: [],
        status: "active",
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setIsLoading(true);
            const data = await staffService.getAllStaff();
            setStaff(data);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await staffService.createStaff(formData);
            toast({
                title: "Success",
                description: "Staff member created successfully",
            });
            setIsCreateDialogOpen(false);
            resetForm();
            loadStaff();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        try {
            await staffService.updateStaff(editingStaff._id, formData);
            toast({
                title: "Success",
                description: "Staff member updated successfully",
            });
            setIsEditDialogOpen(false);
            setEditingStaff(null);
            resetForm();
            loadStaff();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteStaff = async () => {
        try {
            await staffService.deleteStaff(deleteStaffId);
            toast({
                title: "Success",
                description: "Staff member deleted successfully",
            });
            setDeleteStaffId(null);
            loadStaff();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            name: staffMember.name,
            email: staffMember.email,
            password: "",
            specializations: staffMember.specializations,
            status: staffMember.status,
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            specializations: [],
            status: "active",
        });
    };

    const toggleSpecialization = (category) => {
        setFormData((prev) => ({
            ...prev,
            specializations: prev.specializations.includes(category)
                ? prev.specializations.filter((s) => s !== category)
                : [...prev.specializations, category],
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <div className="animate-pulse">
                    <Card>
                        <CardContent className="p-6">
                            <div className="h-40 bg-muted rounded" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const activeStaff = staff.filter((s) => s.status === "active");
    const totalAssignments = staff.reduce((sum, s) => sum + (s.totalAssigned || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage staff members and their complaint assignments
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleCreateStaff}>
                            <DialogHeader>
                                <DialogTitle>Create Staff Member</DialogTitle>
                                <DialogDescription>
                                    Add a new staff member to handle complaints
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Specializations</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Select complaint categories this staff can handle
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {COMPLAINT_CATEGORIES.map((cat) => (
                                            <div key={cat.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`create-${cat.value}`}
                                                    checked={formData.specializations.includes(cat.value)}
                                                    onCheckedChange={() => toggleSpecialization(cat.value)}
                                                />
                                                <label
                                                    htmlFor={`create-${cat.value}`}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {cat.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Staff</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Staff</p>
                                <p className="text-2xl font-bold">{staff.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-success/10">
                                <CheckCircle className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Staff</p>
                                <p className="text-2xl font-bold">{activeStaff.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-info/10">
                                <FileText className="h-6 w-6 text-info" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Assignments</p>
                                <p className="text-2xl font-bold">{totalAssignments}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Members</CardTitle>
                </CardHeader>
                <CardContent>
                    {staff.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No staff members yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add your first staff member to start assigning complaints
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {staff.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">{member.name}</h3>
                                            <Badge
                                                variant={member.status === "active" ? "default" : "secondary"}
                                            >
                                                {member.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                {member.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-4 w-4" />
                                                {member.activeComplaints || 0} active
                                            </div>
                                        </div>
                                        {member.specializations.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                                                {member.specializations.map((spec) => (
                                                    <Badge key={spec} variant="outline" className="text-xs capitalize">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                <span className="italic">Can handle all categories</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/admin/staff/${member._id}/complaints`}>
                                            <Button variant="outline" size="sm">
                                                View Complaints
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(member)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeleteStaffId(member._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleUpdateStaff}>
                        <DialogHeader>
                            <DialogTitle>Edit Staff Member</DialogTitle>
                            <DialogDescription>
                                Update staff member information
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Specializations</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {COMPLAINT_CATEGORIES.map((cat) => (
                                        <div key={cat.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-${cat.value}`}
                                                checked={formData.specializations.includes(cat.value)}
                                                onCheckedChange={() => toggleSpecialization(cat.value)}
                                            />
                                            <label
                                                htmlFor={`edit-${cat.value}`}
                                                className="text-sm cursor-pointer"
                                            >
                                                {cat.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingStaff(null);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update Staff</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteStaffId} onOpenChange={() => setDeleteStaffId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this staff member? This will unassign all
                            their complaints. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteStaff}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
