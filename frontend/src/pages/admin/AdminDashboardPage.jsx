import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  Shield,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  FileSearch,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Zap,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { complaintService } from "@/services/complaintService";
import { staffService } from "@/services/staffService";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staffMetrics, setStaffMetrics] = useState({ total: 0, active: 0 });

  useEffect(() => {
    loadMetrics();
    loadStaffMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await complaintService.getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error("Failed to load metrics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffMetrics = async () => {
    try {
      const staff = await staffService.getAllStaff();
      setStaffMetrics({
        total: staff.length,
        active: staff.filter((s) => s.status === "active").length,
      });
    } catch (e) {
      console.error("Failed to load staff metrics:", e);
      // Set default values on error (e.g., not authenticated)
      setStaffMetrics({ total: 0, active: 0 });
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

  if (!metrics) {
    return <div className="text-destructive">Failed to load dashboard data</div>;
  }

  const statCards = [
    {
      title: "Total Complaints",
      value: metrics.totalComplaints,
      icon: FileText,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "High Priority",
      value: metrics.highPriorityCount,
      icon: AlertTriangle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Safety Related",
      value: metrics.safetyRelatedCount,
      icon: Shield,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Anonymous",
      value: metrics.anonymousCount,
      subValue: `${metrics.identifiedCount} identified`,
      icon: UserX,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Staff Members",
      value: staffMetrics.active,
      subValue: `${staffMetrics.total} total`,
      icon: Users,
      iconColor: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const statusCards = [
    { status: "submitted", label: "Submitted", icon: Clock, color: "text-info" },
    {
      status: "in_review",
      label: "In Review",
      icon: FileSearch,
      color: "text-warning",
    },
    {
      status: "resolved",
      label: "Resolved",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      status: "rejected",
      label: "Rejected",
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  // Sort categories by count descending
  const topCategories = metrics.categoryBreakdown
    ? [...metrics.categoryBreakdown].sort((a, b) => b.count - a.count).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your complaint management system
          </p>
        </div>
        <Link to="/admin/complaints">
          <Button className="gap-2">
            View All Complaints
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {statusCards.map((item) => {
                const count = metrics.statusBreakdown[item.status];
                const percentage =
                  metrics.totalComplaints > 0
                    ? Math.round((count / metrics.totalComplaints) * 100)
                    : 0;

                return (
                  <div
                    key={item.status}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
                  >
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold">{count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-muted-foreground">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resolution Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resolution Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-3xl font-bold text-success">
                {metrics.resolvedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">complaints</p>
            </div>
            <div className="p-4 bg-info/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-info">
                {metrics.avgResolutionTime}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">hours</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
              <p className="text-3xl font-bold text-primary">
                {metrics.totalComplaints > 0
                  ? Math.round(
                    (metrics.resolvedCount / metrics.totalComplaints) * 100
                  )
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">of all complaints</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Complaint Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map((cat, idx) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium capitalize">
                          {cat.category}
                        </p>
                        <p className="text-sm font-bold">{cat.count}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${idx === 0
                            ? "bg-primary"
                            : idx === 1
                              ? "bg-secondary"
                              : idx === 2
                                ? "bg-accent"
                                : "bg-muted-foreground"
                            }`}
                          style={{
                            width: `${(cat.count /
                              (topCategories[0]?.count || 1)) *
                              100
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.priorityBreakdown).map(
                ([priority, count]) => (
                  <div key={priority} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium capitalize">
                          {priority}
                        </p>
                        <p className="text-sm font-bold">{count}</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${priority === "critical"
                            ? "bg-destructive"
                            : priority === "high"
                              ? "bg-orange-500"
                              : priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          style={{
                            width: `${Math.max(
                              (count / (metrics.totalComplaints || 1)) * 100,
                              5
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/complaints?status=submitted">
              <Button variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                New Complaints ({metrics.statusBreakdown.submitted})
              </Button>
            </Link>
            <Link to="/admin/complaints?status=in_review">
              <Button variant="outline" className="gap-2">
                <FileSearch className="h-4 w-4" />
                In Review ({metrics.statusBreakdown.in_review})
              </Button>
            </Link>
            <Link to="/admin/complaints?priority=critical">
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical ({metrics.priorityBreakdown.critical})
              </Button>
            </Link>
            <Link to="/admin/complaints?category=safety">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Safety ({metrics.safetyRelatedCount})
              </Button>
            </Link>
            <Link to="/admin/staff">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Manage Staff ({staffMetrics.total})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
