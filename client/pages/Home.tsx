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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePortfolio } from "../contexts/PortfolioContext";
import { getExistingWallet, getUserId, snKeys } from "../lib/session";
import { useAutoSwap } from "../lib/useAutoSwap";

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

export default function Home() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { totalBalance, loading, refreshBalances, assets } = usePortfolio();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Withdraw state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  // Auto-swap state
  const {
    isSwapping: isAutoSwapping,
    swapSuccess: autoSwapSuccess,
    swapError: autoSwapError,
    txHash: autoSwapTxHash,
    executeAutoSwap,
    resetSwapState: resetAutoSwapState,
  } = useAutoSwap();

  // Get wallet address from session
  const walletAddress = (() => {
    try {
      const userId = getUserId();
      const existingWallet = getExistingWallet(userId);
      return existingWallet ? existingWallet.address : null;
    } catch {
      return null;
    }
  })();

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      // In a real app, you might show a toast notification here
      console.log("Wallet address copied:", walletAddress);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalances();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress) {
      setWithdrawError("Wallet not connected");
      return;
    }

    if (!withdrawAddress || !withdrawAmount) {
      setWithdrawError("Please enter recipient address and amount");
      return;
    }

    if (!selectedAsset) {
      setWithdrawError("Please select an asset");
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError("");
    setWithdrawSuccess(false);

    try {
      // Get user's wallet data from localStorage
      const userId = getUserId();
      const walletKey = snKeys.wallet(userId);
      const walletData = localStorage.getItem(walletKey);

      if (!walletData) {
        throw new Error("Wallet not found");
      }

      const parsedWalletData = JSON.parse(walletData);

      // Create StarkNet account instance with the private key
      const { Account, RpcProvider, CallData } = await import("starknet");

      // Initialize the RPC provider for Starknet mainnet
      const provider = new RpcProvider({
        nodeUrl: "https://starknet-mainnet.public.blastapi.io",
      });

      // Create account instance
      const account = new Account({
        provider,
        address: parsedWalletData.address,
        signer: parsedWalletData.privateKey,
      });

      // Prepare the transaction
      const amountInWei = BigInt(
        parseFloat(withdrawAmount) * Math.pow(10, selectedAsset.decimals),
      ).toString();

      // Transfer call data
      const transferCall = {
        contractAddress: selectedAsset.contractAddress,
        entrypoint: "transfer",
        calldata: CallData.compile({
          recipient: withdrawAddress,
          amount: [amountInWei, "0x0"], // low and high parts
        }),
      };

      // Estimate fee
      const feeEstimate = await account.estimateInvokeFee([transferCall]);
      const suggestedMaxFee = feeEstimate.overall_fee;

      // Execute the transaction
      const result = await account.execute([transferCall]);

      console.log("Transaction sent:", result);

      // Wait for transaction to be accepted
      await provider.waitForTransaction(result.transaction_hash, {
        retryInterval: 1000,
      });

      // Successful withdrawal
      setWithdrawSuccess(true);
      setWithdrawAddress("");
      setWithdrawAmount("");

      // Reset success status after 5 seconds
      setTimeout(() => setWithdrawSuccess(false), 5000);

      // Refresh balances after successful withdrawal
      await refreshBalances();
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to withdraw crypto`;
      setWithdrawError(errorMessage);
      console.error("Withdrawal error:", err);
    } finally {
      setIsWithdrawing(false);
    }
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
              <h2 className="text-3xl font-bold">
                ₦{loading ? "Loading..." : totalBalance.toLocaleString()}
              </h2>
            ) : (
              <h2 className="text-3xl font-bold">****</h2>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
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
          </div>
          <div className="flex items-center justify-center gap-1 text-sm opacity-90 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% this week</span>
          </div>
          {/* Wallet Address Display */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm opacity-90">
              {walletAddress
                ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Wallet: Not connected"}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={handleCopyAddress}
              disabled={!walletAddress}
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
            <div className="grid grid-cols-3 gap-4">
              <Button asChild className="h-12 flex-col gap-1">
                <Link to="/payments?tab=receive">
                  <QrCode className="w-5 h-5" />
                  <span className="text-sm">Receive</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-col gap-1"
                onClick={() => setShowWithdrawDialog(true)}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-sm">Withdraw</span>
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-col gap-1"
                onClick={executeAutoSwap}
                disabled={isAutoSwapping}
              >
                {isAutoSwapping ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    <span className="text-sm">Swapping...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    <span className="text-sm">Auto Swap</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-swap Status */}
      {autoSwapSuccess === true && autoSwapTxHash && (
        <div className="px-6 mb-6">
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Successfully swapped STRK to USDC</span>
            </div>
            <div className="mt-2">
              <button
                onClick={() =>
                  window.open(
                    `https://starkscan.co/tx/${autoSwapTxHash}`,
                    "_blank",
                  )
                }
                className="text-xs text-green-600 dark:text-green-400 underline"
              >
                View transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {autoSwapSuccess === false && autoSwapError && (
        <div className="px-6 mb-6">
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Auto-swap failed: {autoSwapError}</span>
            </div>
          </div>
        </div>
      )}

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

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              Withdraw Crypto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {withdrawSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Successfully withdrawn {withdrawAmount}{" "}
                    {selectedAsset?.symbol || "crypto"}
                  </span>
                </div>
              </div>
            )}

            {withdrawError && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{withdrawError}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dialog-asset-select">Select Asset</Label>
              <Select
                value={selectedAsset?.id || ""}
                onValueChange={(value) => {
                  const asset = assets.find((a) => a.id === value);
                  if (asset) setSelectedAsset(asset);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.amount} {asset.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAsset && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dialog-withdraw-address">
                    Recipient Address
                  </Label>
                  <Input
                    id="dialog-withdraw-address"
                    placeholder="Enter recipient wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dialog-withdraw-amount">Amount</Label>
                  <Input
                    id="dialog-withdraw-amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {selectedAsset.amount} {selectedAsset.symbol}
                  </p>
                </div>

                <Button
                  onClick={handleWithdraw}
                  className="w-full"
                  disabled={isWithdrawing || !walletAddress || !selectedAsset}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw {selectedAsset.symbol}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
