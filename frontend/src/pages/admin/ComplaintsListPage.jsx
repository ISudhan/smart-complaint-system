import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter, ChevronLeft, ChevronRight, Eye,
  UserX, User, AlertTriangle, Shield, UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { complaintService } from '@/services/complaintService';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'safety', label: 'Safety' },
  { value: 'financial', label: 'Financial' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'library', label: 'Library' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const priorities = [
  { value: 'all', label: 'All Priority' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const ITEMS_PER_PAGE = 10;

export default function ComplaintsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    priority: searchParams.get('priority') || 'all',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const result = await complaintService.getAllComplaints({
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : filters.category,
        priority: filters.priority === 'all' ? undefined : filters.priority,
        page: filters.page,
        limit: ITEMS_PER_PAGE,
      });
      setComplaints(result.complaints || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: key === 'page' ? parseInt(value) : 1 };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.priority !== 'all') params.set('priority', newFilters.priority);
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Complaints</h1>
        <span className="text-sm text-muted-foreground">{total} total complaints</span>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap gap-4">
            <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(v) => updateFilter('priority', v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-2 border-black shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No complaints found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white text-black border-2 border-black">
                    <th className="w-1/8 text-left px-4 py-4 font-semibold border-r-2 border-black">Complaint ID</th>
                    <th className="w-1/12 text-left px-4 py-4 font-semibold border-r-2 border-black">Type</th>
                    <th className="w-1/8 text-left px-4 py-4 font-semibold border-r-2 border-black">Category</th>
                    <th className="w-1/12 text-left px-4 py-4 font-semibold border-r-2 border-black">Priority</th>
                    <th className="w-1/12 text-left px-4 py-4 font-semibold border-r-2 border-black">Status</th>
                    <th className="w-1/8 text-left px-4 py-4 font-semibold border-r-2 border-black">Assigned To</th>
                    <th className="w-1/12 text-left px-4 py-4 font-semibold border-r-2 border-black">Date</th>
                    <th className="w-1/10 text-right px-4 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint, idx) => (
                    <tr key={complaint.complaintId} className="border-b-2 border-black hover:bg-gray-50 transition-colors bg-white">
                      <td className="w-1/8 font-mono text-xs px-4 py-4 border-r-2 border-black text-left">
                        {complaint.complaintId}
                      </td>
                      <td className="w-1/12 px-4 py-4 border-r-2 border-black text-left">
                        <div className="flex items-center gap-1.5">
                          {complaint.isAnonymous ? (
                            <>
                              <UserX className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs">Anonymous</span>
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="text-xs">Identified</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="w-1/8 px-4 py-4 border-r-2 border-black text-left">
                        <div className="flex items-center gap-1.5">
                          {complaint.category === 'safety' && (
                            <Shield className="h-4 w-4 text-warning flex-shrink-0" />
                          )}
                          <span className="capitalize text-xs">
                            {complaint.category || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="w-1/12 px-4 py-4 border-r-2 border-black text-left">
                        {complaint.mlOutput && (
                          <div className="flex items-center gap-1.5">
                            {(complaint.mlOutput.priority === 'high' || complaint.mlOutput.priority === 'critical') && (
                              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                            )}
                            <PriorityBadge priority={complaint.mlOutput.priority} />
                          </div>
                        )}
                      </td>
                      <td className="w-1/12 px-4 py-4 border-r-2 border-black text-left">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="w-1/8 px-4 py-4 border-r-2 border-black text-left">
                        {complaint.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <UserCog className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-xs text-primary font-medium truncate">
                              {complaint.assignedTo.name || 'Staff'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="w-1/12 text-xs text-muted-foreground px-4 py-4 border-r-2 border-black text-left">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="w-1/10 text-right px-4 py-4">
                        <Link to={`/admin/complaints/${complaint.complaintId}`}>
                          <Button variant="ghost" size="sm" className="gap-1.5 h-8 hover:bg-gray-200">
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">View</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(filters.page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(filters.page * ITEMS_PER_PAGE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => updateFilter('page', (filters.page - 1).toString())}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm px-2">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages}
              onClick={() => updateFilter('page', (filters.page + 1).toString())}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
