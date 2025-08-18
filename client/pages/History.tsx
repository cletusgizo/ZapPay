import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const transactions = [
  {
    id: "tx_001",
    type: "received",
    amount: "0.5 ETH",
    nairaAmount: "₦850,000",
    status: "settled",
    timestamp: "2024-01-15 14:30:00",
    address: "0x742d...5A1f",
    rate: "₦1,700,000/ETH",
    txHash: "0xabc123...def789",
    bankTransfer: "Completed - GTBank ****1234"
  },
  {
    id: "tx_002", 
    type: "sent",
    amount: "100 USDC",
    nairaAmount: "₦75,000",
    status: "pending",
    timestamp: "2024-01-15 13:15:00",
    address: "0x456A...8B2c",
    rate: "₦750/USDC",
    txHash: "0x123abc...789def",
    bankTransfer: null
  },
  {
    id: "tx_003",
    type: "received",
    amount: "2000 STRK",
    nairaAmount: "₦120,000",
    status: "settled",
    timestamp: "2024-01-15 11:45:00",
    address: "0x789C...4D3e",
    rate: "₦60/STRK",
    txHash: "0x456def...123abc",
    bankTransfer: "Completed - GTBank ****1234"
  },
  {
    id: "tx_004",
    type: "received",
    amount: "0.02 BTC",
    nairaAmount: "₦1,000,000",
    status: "failed",
    timestamp: "2024-01-15 10:20:00",
    address: "0x321F...6E9d",
    rate: "₦50,000,000/BTC",
    txHash: "0x789ghi...456jkl",
    bankTransfer: null
  },
  {
    id: "tx_005",
    type: "sent",
    amount: "250 USDC",
    nairaAmount: "₦187,500",
    status: "settled",
    timestamp: "2024-01-14 16:00:00",
    address: "0xABC1...2DEF",
    rate: "₦750/USDC",
    txHash: "0x987zyx...321wvu",
    bankTransfer: null
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.nairaAmount.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "settled":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "";
    }
  };

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
          <h1 className="text-xl font-semibold">Transaction History</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 space-y-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <main className="px-6 pb-6">
        <div className="max-w-md mx-auto space-y-3">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No transactions found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((tx) => (
              <Link key={tx.id} to={`/history/${tx.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
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
                            <p className="text-sm text-muted-foreground">
                              {tx.type === "received" ? `From ${tx.address}` : `To ${tx.address}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{tx.nairaAmount}</p>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(tx.status)}
                              <Badge className={`text-xs ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          <span>Rate: {tx.rate}</span>
                        </div>
                        
                        {tx.bankTransfer && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>{tx.bankTransfer}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
