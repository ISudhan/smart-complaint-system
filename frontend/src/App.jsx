import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import AnonymousComplaintPage from "./pages/AnonymousComplaintPage";
import IdentifiedComplaintPage from "./pages/IdentifiedComplaintPage";
import SubmissionConfirmationPage from "./pages/SubmissionConfirmationPage";
import TrackComplaintPage from "./pages/TrackComplaintPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ComplaintsListPage from "./pages/admin/ComplaintsListPage";
import ComplaintDetailPage from "./pages/admin/ComplaintDetailPage";
import StaffManagementPage from "./pages/admin/StaffManagementPage";
import StaffComplaintsPage from "./pages/admin/StaffComplaintsPage";

// Staff Pages
import StaffLoginPage from "./pages/staff/StaffLoginPage";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboardPage from "./pages/staff/StaffDashboardPage";
import StaffComplaintsListPage from "./pages/staff/StaffComplaintsPage";
import StaffComplaintDetailPage from "./pages/staff/StaffComplaintDetailPage";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/submit/anonymous" element={<AnonymousComplaintPage />} />
                    <Route path="/submit/identified" element={<IdentifiedComplaintPage />} />
                    <Route path="/submitted/:complaintId" element={<SubmissionConfirmationPage />} />
                    <Route path="/track" element={<TrackComplaintPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="complaints" element={<ComplaintsListPage />} />
                        <Route path="complaints/:complaintId" element={<ComplaintDetailPage />} />
                        <Route path="staff" element={<StaffManagementPage />} />
                        <Route path="staff/:staffId/complaints" element={<StaffComplaintsPage />} />
                    </Route>

                    {/* Staff Routes */}
                    <Route path="/staff/login" element={<StaffLoginPage />} />
                    <Route path="/staff" element={<StaffLayout />}>
                        <Route path="dashboard" element={<StaffDashboardPage />} />
                        <Route path="complaints" element={<StaffComplaintsListPage />} />
                        <Route path="complaints/:complaintId" element={<StaffComplaintDetailPage />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
