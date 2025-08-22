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
import { ArrowLeft, Eye, EyeOff, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserId, generateStarknetAddress, snKeys } from "@/lib/session";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here

    // Generate a new wallet address for this user
    try {
      const userId = getUserId();
      const walletData = await generateStarknetAddress();

      // Store the wallet address with user-specific key
      localStorage.setItem(snKeys.address(userId), walletData.address);

      console.log("Generated new wallet address for user:", walletData.address);
    } catch (error) {
      console.error("Failed to generate wallet address:", error);
      // Continue with login even if wallet generation fails
    }

    navigate("/home");
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
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your ZapPay account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Button type="submit" className="w-full h-12">
                  Sign In
                </Button>
              </form>

              <div className="text-center">
                <Button variant="link" className="text-sm">
                  Forgot password?
                </Button>
              </div>

              <div className="relative">
                <Separator />
              </div>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link to="/register">Create one</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
