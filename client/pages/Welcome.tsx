import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Smartphone, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary">ZapPay</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
          Receive crypto. Get Naira. Instantly.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8">
        <div className="max-w-md mx-auto space-y-8">
          {/* Features */}
          <div className="grid gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Conversion</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Convert crypto to Naira automatically
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Trusted</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Built on StarkNet with bank-grade security
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Transfer to your bank in seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full h-12 text-base">
              <Link to="/register">
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full h-12 text-base">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Copyright @ ZapPay</p>
          </div>
        </div>
      </main>
    </div>
  );
}
