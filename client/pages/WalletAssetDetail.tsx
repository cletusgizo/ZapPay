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
  MoreHorizontal,
  ExternalLink,
  Copy
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const assetData = {
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    amount: "1.2345",
    nairaValue: "₦2,098,650",
    usdValue: "$1,234.56",
    change24h: "+5.2%",
    isPositive: true,
    icon: "🔷",
    address: "0x742d35Cc6C4C8B9A5A1f67E8F2D3B9C1A7E5F8G2",
    price: "₦1,700,000",
    marketCap: "₦245T",
    volume24h: "₦12.5T"
  },
  strk: {
    name: "StarkNet",
    symbol: "STRK",
    amount: "15,000",
    nairaValue: "₦900,000",
    usdValue: "$600.00", 
    change24h: "-2.1%",
    isPositive: false,
    icon: "⭐",
    address: "0x456A8B2c9D1E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S",
    price: "₦60",
    marketCap: "₦4.2T",
    volume24h: "₦850B"
  },
  usdc: {
    name: "USD Coin",
    symbol: "USDC",
    amount: "500.00",
    nairaValue: "₦375,000",
    usdValue: "$500.00",
    change24h: "+0.1%",
    isPositive: true,
    icon: "💵",
    address: "0x789C4D3e1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U",
    price: "₦750",
    marketCap: "₦37T",
    volume24h: "₦5.8T"
  },
  btc: {
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.0156",
    nairaValue: "₦780,000",
    usdValue: "$520.00",
    change24h: "+3.8%",
    isPositive: true,
    icon: "₿",
    address: "0x321F6E9d8C5B4A3E2F1G0H9I8J7K6L5M4N3O2P1Q",
    price: "₦50,000,000",
    marketCap: "₦750T",
    volume24h: "₦18T"
  }
};

const recentTransactions = [
  {
    id: "1",
    type: "received",
    amount: "0.25 ETH",
    nairaAmount: "₦425,000",
    time: "2 hours ago",
    txHash: "0xabc123...def789"
  },
  {
    id: "2", 
    type: "sent",
    amount: "0.1 ETH",
    nairaAmount: "₦170,000",
    time: "1 day ago",
    txHash: "0x456def...123abc"
  },
  {
    id: "3",
    type: "received",
    amount: "0.5 ETH",
    nairaAmount: "₦850,000",
    time: "3 days ago",
    txHash: "0x789ghi...456jkl"
  }
];

export default function WalletAssetDetail() {
  const { assetId } = useParams<{ assetId: string }>();
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  const asset = assetData[assetId as keyof typeof assetData];
  
  if (!asset) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested cryptocurrency asset could not be found.</p>
          <Button asChild>
            <Link to="/wallet">Back to Wallet</Link>
          </Button>
        </div>
      </div>
    );
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(asset.address);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/wallet">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{asset.icon}</span>
            <div>
              <h1 className="text-lg font-semibold">{asset.name}</h1>
              <p className="text-sm text-muted-foreground">{asset.symbol}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Asset Balance */}
          <Card className="bg-gradient-to-br from-primary to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <p className="text-white/80">Your Balance</p>
                {balanceVisible ? (
                  <>
                    <h2 className="text-3xl font-bold">{asset.amount} {asset.symbol}</h2>
                    <p className="text-white/90">{asset.nairaValue}</p>
                    <p className="text-sm text-white/70">≈ {asset.usdValue} USD</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold">**** {asset.symbol}</h2>
                    <p className="text-white/90">****</p>
                    <p className="text-sm text-white/70">**** USD</p>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-1 mt-4 text-sm">
                {asset.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{asset.change24h} (24h)</span>
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
                Send
              </Link>
            </Button>
          </div>

          {/* Asset Information */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="font-semibold">{asset.price}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className={`font-semibold ${asset.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change24h}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-semibold">{asset.marketCap}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-semibold">{asset.volume24h}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Address */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Address</CardTitle>
              <CardDescription>
                Your {asset.name} receiving address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm break-all">{asset.address}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyAddress} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest {asset.symbol} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "received" 
                        ? "bg-green-100 dark:bg-green-900" 
                        : "bg-orange-100 dark:bg-orange-900"
                    }`}>
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
                            {tx.type === "received" ? "Received" : "Sent"} {tx.amount}
                          </p>
                          <p className="text-sm text-muted-foreground">{tx.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{tx.nairaAmount}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {tx.txHash}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/history">
                  View All Transactions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
