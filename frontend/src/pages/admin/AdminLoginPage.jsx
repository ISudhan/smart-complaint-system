import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, AlertTriangle, Eye, EyeOff, Lock, Mail, Info } from "lucide-react";
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

export default function AdminLoginPage() {
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
      const result = await authService.login(
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate("/admin/dashboard");
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
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl mb-3 shadow-lg">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">
                Secure access for authorized personnel only
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-2 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center text-xs">
                  Enter your credentials to access the admin dashboard
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
                        placeholder="a****@*****.edu"
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 flex items-start gap-2 animate-in fade-in-50 duration-200">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Sign In to Dashboard
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Credentials
                <div className="pt-4 border-t">
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">
                          Demo Credentials Available
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Use these credentials to explore the system
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-background rounded-md p-2.5 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Admin Account</p>
                        <p className="text-xs font-mono text-foreground">admin@university.edu</p>
                        <p className="text-xs font-mono text-foreground">admin123</p>
                      </div>
                      <div className="bg-background rounded-md p-2.5 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Staff Account</p>
                        <p className="text-xs font-mono text-foreground">staff@university.edu</p>
                        <p className="text-xs font-mono text-foreground">staff123</p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* Footer Note */}
            <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
              This is a secure area. All login attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}