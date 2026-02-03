import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2, AlertTriangle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

export default function StaffLoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim() || !formData.password) {
            setError("Please enter both email and password");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.staffLogin(
                formData.email,
                formData.password
            );

            if (result.success) {
                navigate("/staff/dashboard");
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-200px)] py-8 md:py-12 bg-gradient-to-b from-muted/30 to-background flex items-center">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-md mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl mb-3 shadow-lg">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Staff Portal</h1>
                            <p className="text-sm text-muted-foreground">
                                Access your assigned complaints and manage cases
                            </p>
                        </div>

                        {/* Login Card */}
                        <Card className="border-2 shadow-xl">
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl text-center">Staff Sign In</CardTitle>
                                <CardDescription className="text-center text-xs">
                                    Enter your credentials to access your dashboard
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="staff@university.edu"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                className="pl-10 h-11 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, password: e.target.value })
                                                }
                                                className="pl-10 pr-10 h-11 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Additional Info */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                Staff accounts are managed by administrators.
                                <br />
                                Contact your admin if you need access or have login issues.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
