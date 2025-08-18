import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  Eye,
  EyeOff,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const portfolioData = [
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    amount: "1.2345",
    nairaValue: "₦2,098,650",
    usdValue: "$1,234.56",
    change24h: "+5.2%",
    isPositive: true,
    icon: "🔷"
  },
  {
    id: "strk",
    name: "StarkNet",
    symbol: "STRK", 
    amount: "15,000",
    nairaValue: "₦900,000",
    usdValue: "$600.00",
    change24h: "-2.1%",
    isPositive: false,
    icon: "⭐"
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    amount: "500.00",
    nairaValue: "₦375,000",
    usdValue: "$500.00",
    change24h: "+0.1%",
    isPositive: true,
    icon: "💵"
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.0156",
    nairaValue: "₦780,000",
    usdValue: "$520.00",
    change24h: "+3.8%",
    isPositive: true,
    icon: "₿"
  }
];

export default function Wallet() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  const totalNairaValue = portfolioData.reduce((sum, asset) => {
    return sum + parseFloat(asset.nairaValue.replace(/[₦,]/g, ''));
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Wallet</h1>
          <div className="ml-auto">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Total Portfolio Balance */}
          <Card className="bg-gradient-to-br from-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <WalletIcon className="w-6 h-6" />
                  <span className="text-lg font-semibold">Total Portfolio</span>
                </div>
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
              
              <div className="space-y-2">
                {balanceVisible ? (
                  <>
                    <h2 className="text-3xl font-bold">₦{totalNairaValue.toLocaleString()}</h2>
                    <p className="text-white/80">≈ ${(totalNairaValue / 750).toFixed(2)} USD</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold">****</h2>
                    <p className="text-white/80">**** USD</p>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+8.5% this week</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button asChild className="h-12">
              <Link to="/payments?tab=receive">
                <ArrowDownLeft className="w-5 h-5 mr-2" />
                Receive
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-12">
              <Link to="/payments?tab=send">
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Withdraw
              </Link>
            </Button>
          </div>

          {/* Asset List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>
                Click any asset to view details and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolioData.filter(asset => asset.id !== "btc").map((asset) => (
                <Link 
                  key={asset.id} 
                  to={`/wallet/${asset.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                      {asset.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {balanceVisible ? asset.amount : "****"} {asset.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {balanceVisible ? asset.nairaValue : "****"}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={asset.isPositive ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {asset.isPositive ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {asset.change24h}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className="text-lg font-bold text-green-600">+₦156,000</p>
                  <p className="text-xs text-green-500">+4.2%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">7d Change</p>
                  <p className="text-lg font-bold text-blue-600">+₦298,000</p>
                  <p className="text-xs text-blue-500">+8.5%</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Best Performer</p>
                <p className="font-semibold">Ethereum (ETH)</p>
                <p className="text-sm text-green-600">+5.2% today</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
