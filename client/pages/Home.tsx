import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import {
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Bell,
  TrendingUp,
  Zap,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const recentTransactions = [
  {
    id: "1",
    type: "received",
    amount: "0.5 ETH",
    nairaAmount: "₦850,000",
    status: "settled",
    time: "2 minutes ago",
    sender: "0x742d...5A1f",
  },
  {
    id: "2",
    type: "sent",
    amount: "100 USDC",
    nairaAmount: "₦75,000",
    status: "pending",
    time: "1 hour ago",
    recipient: "0x456A...8B2c",
  },
  {
    id: "3",
    type: "received",
    amount: "2000 STRK",
    nairaAmount: "₦120,000",
    status: "settled",
    time: "3 hours ago",
    sender: "0x789C...4D3e",
  },
];

// Mock wallet address (in a real app, this would come from user context or API)
const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export default function Home() {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // In a real app, you might show a toast notification here
    console.log("Wallet address copied:", walletAddress);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">ZapPay</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Total Portfolio Balance</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {balanceVisible ? (
              <h2 className="text-3xl font-bold">₦2,045,000</h2>
            ) : (
              <h2 className="text-3xl font-bold">****</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={() => setBalanceVisible(!balanceVisible)}
            >
              {balanceVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-1 text-sm opacity-90 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% this week</span>
          </div>
          {/* Wallet Address Display */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm opacity-90">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={handleCopyAddress}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="px-6 -mt-8 lg:-mt-8 mt-5 mb-6">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="h-12 flex-col gap-1">
                <Link to="/payments?tab=receive">
                  <QrCode className="w-5 h-5" />
                  <span className="text-sm">Receive</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-12 flex-col gap-1">
                <Link to="/payments?tab=send">
                  <ArrowUpRight className="w-5 h-5" />
                  <span className="text-sm">Withdraw</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Panel */}
      <div className="px-6 mb-6">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Payment Received!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  0.5 ETH (₦850,000) automatically converted and transferred to
                  your bank.
                </p>
                <p className="text-xs text-green-500 dark:text-green-500 mt-1">
                  2 minutes ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Payments</h3>
          <Button variant="link" asChild className="text-primary p-0">
            <Link to="/history">View All</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <Card key={tx.id} className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "received"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-orange-100 dark:bg-orange-900"
                    }`}
                  >
                    {tx.type === "received" ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {tx.type === "received" ? "Received" : "Sent"}{" "}
                          {tx.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.type === "received"
                            ? `From ${tx.sender}`
                            : `To ${tx.recipient}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{tx.nairaAmount}</p>
                        <Badge
                          variant={
                            tx.status === "settled" ? "default" : "secondary"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tx.time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
