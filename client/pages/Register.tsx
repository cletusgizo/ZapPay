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
import { Separator } from "@/components/ui/separator";
import OtpModal from "@/components/OtpModal";
import { ArrowLeft, Eye, EyeOff, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = "https://zappay-global.onrender.com";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setError("");

    try {
      // Call backend API to register user
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Save user ID for OTP verification
        if (result.userId) {
          setUserId(result.userId);
          localStorage.setItem("tempUserId", result.userId);
        }

        // Show OTP modal after successful registration
        setShowOtpModal(true);
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtpVerify = async (otp: string): Promise<boolean> => {
    try {
      // Call OTP verification endpoint
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId || localStorage.getItem("tempUserId"),
          otp: otp,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store user data in localStorage for session management
        if (result.userId && result.token) {
          localStorage.setItem("userId", result.userId);
          localStorage.setItem("authToken", result.token);
        }

        // Clean up temporary user ID
        localStorage.removeItem("tempUserId");

        // Close modal and navigate to home
        setShowOtpModal(false);
        navigate("/home");
        return true;
      } else {
        throw new Error(result.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      // Re-throw the error so it can be handled by the OtpModal
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary">ZapPay</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Join thousands of Nigerian businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +2349047741498"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={
                    !formData.email ||
                    !formData.phone ||
                    !formData.password ||
                    isRegistering
                  }
                >
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <Separator />
              </div>

              <div className="text-center text-sm">
                <span className="sm:mt-0 -mt-1">Already have an account? </span>
                <Button
                  variant="link"
                  asChild
                  className="p-0 h-auto sm:mt-0 -mt-1"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Button variant="link" className="p-0 h-auto text-xs">
                  Terms of Service
                </Button>{" "}
                and{" "}
                <Button variant="link" className="p-0 h-auto text-xs">
                  Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerify}
        email={formData.email}
      />
    </div>
  );
}
