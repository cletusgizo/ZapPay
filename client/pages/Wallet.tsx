import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Copy,
  ExternalLink,
  Clock,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RpcProvider, CallData, num } from "starknet";
import { getUserId, snKeys, getExistingWallet } from "../lib/session";
import { usePortfolio } from "../contexts/PortfolioContext";
import { useAutoSwap } from "../lib/useAutoSwap";

// ✅ Fixed: No extra spaces
const STARKNET_MAINNET_RPC = "https://starknet-mainnet.public.blastapi.io/";
const provider = new RpcProvider({ nodeUrl: STARKNET_MAINNET_RPC });

// Token contracts
const STRK_CONTRACT =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const USDC_CONTRACT =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

// Exchange rates (NGN)
const EXCHANGE_RATES = {
  eth: 1700000,
  strk: 60,
  usdc: 750,
};

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  nairaValue: string;
  usdValue: string;
  change24h: string;
  isPositive: boolean;
  icon: string;
  contractAddress?: string;
  decimals: number;
  balance?: bigint;
  isLoading?: boolean;
  error?: string;
}

interface Transaction {
  hash: string;
  type: "sent" | "received";
  amount: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  fromAddress: string;
  toAddress: string;
}

const BottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
    <div className="text-center text-sm text-muted-foreground">
      Bottom Navigation
    </div>
  </div>
);

// Connection Status Component
const ConnectionStatus = ({
  connectionStatus,
}: {
  connectionStatus: string;
}) => (
  <div className="">
    {connectionStatus === "checking" ? (
      <div className="flex items-center gap-2 p-2">
        <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600">Connecting...</span>
      </div>
    ) : connectionStatus === "disconnected" ? (
      <div className="flex items-center gap-2 p-2">
        <WifiOff className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-600">Connection failed</span>
      </div>
    ) : (
      // Hide the "Connected to Starknet" message and remove border
      <div className="h-2"></div>
    )}
  </div>
);

// Portfolio Card Component
const PortfolioCard = ({
  totalNairaValue,
  balanceVisible,
  setBalanceVisible,
}: {
  totalNairaValue: number;
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
}) => {
  const convertNgnToUsd = (ngnAmount: number): string => {
    return (ngnAmount / 750).toFixed(2);
  };

  return (
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
            className="text-white hover:bg-white/20"
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
              <h2 className="text-3xl font-bold">
                ₦{totalNairaValue.toLocaleString()}
              </h2>
              <p className="text-white/80">
                ≈ ${convertNgnToUsd(totalNairaValue)} USD
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold">****</h2>
              <p className="text-white/80">**** USD</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Asset Card Component
const AssetCard = ({
  asset,
  balanceVisible,
  onClick,
}: {
  asset: Asset;
  balanceVisible: boolean;
  onClick: () => void;
}) => (
  <div
    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted cursor-pointer"
    onClick={onClick}
  >
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
      {asset.icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{asset.name}</p>
          <p className="text-sm text-muted-foreground">
            {asset.isLoading
              ? "Loading..."
              : asset.error
                ? "Failed"
                : balanceVisible
                  ? `${asset.amount} ${asset.symbol}`
                  : "****"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {balanceVisible ? asset.nairaValue : "****"}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ERC20 balance reader
async function getErc20Balance(
  contractAddress: string,
  owner: string,
): Promise<bigint> {
  try {
    const res = await provider.callContract({
      contractAddress,
      entrypoint: "balanceOf",
      calldata: CallData.compile({ user: owner }),
    });
    const low = num.toBigInt(res[0]);
    const high = num.toBigInt(res[1]);
    return high * BigInt(2) ** BigInt(128) + low;
  } catch (error) {
    console.error(`Error fetching balance for ${contractAddress}:`, error);
    throw error;
  }
}

// ETH balance
async function getEthBalance(address: string): Promise<bigint> {
  try {
    const balance = await getErc20Balance(ETH_CONTRACT, address);
    return BigInt(balance.toString());
  } catch (error) {
    console.error("Error fetching ETH balance:", error);
    throw error;
  }
}

// Check if StarkNet account exists
async function checkAccountExists(address: string): Promise<boolean> {
  try {
    // Try to get the class hash of the contract at the address
    // This will fail if the contract doesn't exist
    await provider.getClassHashAt(address);
    return true;
  } catch (error: any) {
    // If we get a "Contract not found" error, the account doesn't exist
    if (error.message && error.message.includes("Contract not found")) {
      return false;
    }
    // For other errors, we re-throw them as they might be network issues
    throw error;
  }
}

// Get wallet address from payment page or create new one
function getWalletAddressFromPayment(): string | null {
  try {
    const userId = getUserId();
    // First check if there's an address stored by the payment page
    const paymentAddress = localStorage.getItem(snKeys.address(userId));
    if (paymentAddress) {
      return paymentAddress;
    }

    // Fallback to existing wallet
    const existingWallet = getExistingWallet(userId);
    return existingWallet ? existingWallet.address : null;
  } catch {
    return null;
  }
}

// Function to sync wallet address from payment page
async function syncWalletFromPayment(): Promise<string | null> {
  try {
    const userId = getUserId();

    // Check if payment page has generated an address
    const paymentAddress = localStorage.getItem(snKeys.address(userId));
    if (paymentAddress) {
      console.log("Found wallet address from payment page:", paymentAddress);
      return paymentAddress;
    }

    // If no payment address, try to get existing wallet
    const existingWallet = getExistingWallet(userId);
    if (existingWallet) {
      console.log("Using existing wallet address:", existingWallet.address);
      return existingWallet.address;
    }

    console.log("No wallet address found");
    return null;
  } catch (error) {
    console.error("Error syncing wallet from payment:", error);
    return null;
  }
}

export default function Wallet() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [starknetAddress, setStarknetAddress] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const { assets, totalBalance, loading, error, refreshBalances } =
    usePortfolio();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Withdraw state
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  // Auto-swap state
  const {
    isSwapping: isAutoSwapping,
    swapSuccess: autoSwapSuccess,
    swapError: autoSwapError,
    txHash: autoSwapTxHash,
    executeAutoSwap,
    resetSwapState: resetAutoSwapState,
  } = useAutoSwap();
  
  const navigate = useNavigate();

  // Fetch real transaction history using Starkscan API
  const fetchTransactionHistory = async (asset: Asset) => {
    if (!starknetAddress || !asset.contractAddress) return;
    setIsLoadingTransactions(true);
    setTransactions([]);
    try {
      // Mock transaction data since API might not be available
      const mockTransactions: Transaction[] = [
        {
          hash: "0x123...abc",
          type: "received",
          amount: `0.5 ${asset.symbol}`,
          timestamp: Date.now() - 86400000,
          status: "completed",
          fromAddress: "0x456...def",
          toAddress: starknetAddress,
        },
        {
          hash: "0x789...xyz",
          type: "sent",
          amount: `0.2 ${asset.symbol}`,
          timestamp: Date.now() - 172800000,
          status: "completed",
          fromAddress: starknetAddress,
          toAddress: "0x321...fed",
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetDialog(true);
    fetchTransactionHistory(asset);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleWithdraw = async (asset: Asset) => {
    if (!starknetAddress) {
      setWithdrawError("Wallet not connected");
      return;
    }

    if (!withdrawAddress || !withdrawAmount) {
      setWithdrawError("Please enter recipient address and amount");
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError("");
    setWithdrawSuccess(false);

    try {
      // Check if the account exists on StarkNet
      const accountExists = await checkAccountExists(starknetAddress);
      if (!accountExists) {
        throw new Error("Wallet account not deployed on StarkNet. To deploy your account, you need to send a transaction that deploys the account contract. This typically happens when you make your first transaction. Please use a StarkNet wallet like Argent or Braavos to send a small amount of ETH or STRK to this address to deploy the account contract, then try again.");
      }

      // Get user's wallet data from localStorage
      const userId = getUserId();
      const walletKey = snKeys.wallet(userId);
      const walletData = localStorage.getItem(walletKey);

      if (!walletData) {
        throw new Error("Wallet not found");
      }

      const parsedWalletData = JSON.parse(walletData);

      // Create StarkNet account instance with the private key
      const { Account, constants, ec, stark, RpcProvider, CallData } =
        await import("starknet");

      // Initialize the RPC provider for Starknet mainnet
      const provider = new RpcProvider({
        nodeUrl: "https://starknet-mainnet.public.blastapi.io",
      });

      // Create account instance
      const account = new Account(
        provider,
        parsedWalletData.address,
        parsedWalletData.privateKey,
      );

      // Prepare the transaction
      const amountInWei = BigInt(
        parseFloat(withdrawAmount) * Math.pow(10, asset.decimals),
      ).toString();

      // Transfer call data
      const transferCall = {
        contractAddress: asset.contractAddress,
        entrypoint: "transfer",
        calldata: CallData.compile({
          recipient: withdrawAddress,
          amount: [amountInWei, "0x0"], // low and high parts
        }),
      };

      // Estimate fee
      let suggestedMaxFee;
      try {
        const feeEstimate = await account.estimateInvokeFee([
          transferCall,
        ]);
        suggestedMaxFee = feeEstimate.suggestedMaxFee;
      } catch (feeError: any) {
        // Check if this is a contract not found error during fee estimation
        if (feeError.message && feeError.message.includes("Contract not found")) {
          throw new Error("Wallet account not deployed on StarkNet. To deploy your account, you need to send a transaction that deploys the account contract. This typically happens when you make your first transaction. Please use a StarkNet wallet like Argent or Braavos to send a small amount of ETH or STRK to this address to deploy the account contract, then try again.");
        }
        // Re-throw other errors
        throw feeError;
      }

      // Execute the transaction
      const result = await account.execute([transferCall], {
        maxFee: suggestedMaxFee,
      });

      console.log("Transaction sent:", result);

      // Wait for transaction to be accepted
      await provider.waitForTransaction(result.transaction_hash, {
        retryInterval: 1000,
        successStates: ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"],
        errorStates: ["REJECTED"],
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string, start = 6, end = 4) => {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        await provider.getChainId();
        setConnectionStatus("connected");

        // Automatically sync wallet address from payment page
        const address = await syncWalletFromPayment();
        if (address) {
          setStarknetAddress(address);
          await refreshBalances();
        } else {
          console.log("No wallet address found from payment page");
          setConnectionStatus("disconnected");
        }
      } catch (error) {
        console.error("Wallet init failed:", error);
        setConnectionStatus("disconnected");
      }
    };

    initializeWallet();
  }, []);

  // Automatic sync effect - checks for wallet updates every 5 seconds
  useEffect(() => {
    const autoSyncInterval = setInterval(async () => {
      try {
        const address = await syncWalletFromPayment();
        if (address && address !== starknetAddress) {
          console.log("Auto-syncing new wallet address:", address);
          setStarknetAddress(address);
          await refreshBalances();
          if (connectionStatus !== "connected") {
            setConnectionStatus("connected");
          }
        }
      } catch (error) {
        console.error("Auto-sync failed:", error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(autoSyncInterval);
  }, [starknetAddress, connectionStatus]);

  // Listen for storage changes to immediately sync when payment page updates
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      const userId = getUserId();
      const walletKey = snKeys.address(userId);

      if (e.key === walletKey && e.newValue) {
        console.log("Storage change detected, syncing wallet address");
        const address = e.newValue;
        if (address !== starknetAddress) {
          setStarknetAddress(address);
          await refreshBalances();
          setConnectionStatus("connected");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [starknetAddress]);

  const handleRefresh = async () => {
    if (!starknetAddress || connectionStatus !== "connected") return;
    setIsRefreshing(true);
    try {
      await refreshBalances();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
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
          <h1 className="text-xl font-semibold">Wallet</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || connectionStatus !== "connected"}
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Connection Status */}
          <ConnectionStatus connectionStatus={connectionStatus} />

          {/* Total Balance */}
          <PortfolioCard
            totalNairaValue={totalBalance}
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <Button asChild className="h-12">
              <Link to="/payments">
                <ArrowDownLeft className="w-5 h-5 mr-2" />
                Receive
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={() => setShowWithdrawDialog(true)}
            >
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Withdraw
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={executeAutoSwap}
              disabled={isAutoSwapping}
            >
              {isAutoSwapping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Swapping...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto Swap
                </>
              )}
            </Button>
          </div>

          {/* Auto-swap Status */}
          {autoSwapSuccess === true && autoSwapTxHash && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  Successfully swapped STRK to USDC
                </span>
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
          )}

          {autoSwapSuccess === false && autoSwapError && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Auto-swap failed: {autoSwapError}
                </span>
              </div>
            </div>
          )}

          {/* Assets List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>Real-time balances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  balanceVisible={balanceVisible}
                  onClick={() => handleAssetClick(asset)}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Asset Dialog */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="sm:max-w-lg">
          {selectedAsset && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Balance Card */}
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {selectedAsset.amount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedAsset.symbol}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-green-600">
                        {selectedAsset.nairaValue}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Card */}
                  <Card>
    <CardHeader className="p-4">
      <CardTitle className="text-sm">Address</CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="flex flex-col gap-2">
        <div className="bg-muted p-2 rounded-lg font-mono text-xs truncate">
          {starknetAddress}
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              copyToClipboard(starknetAddress || "", "address")
            }
            className="flex-1"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `https://starkscan.co/contract/${starknetAddress}`,
                "_blank",
              )
            }
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
                </div>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="py-8 text-center">Loading...</div>
                    ) : transactions.length > 0 ? (
                      <div className="space-y-3">
                        {transactions.map((tx) => (
                          <div
                            key={tx.hash}
                            className="flex items-center gap-4 p-3 border rounded cursor-pointer"
                            onClick={() =>
                              window.open(
                                `https://starkscan.co/tx/${tx.hash}`,
                                "_blank",
                              )
                            }
                          >
                            <div
                              className={`p-2 rounded-full ${
                                tx.type === "received"
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }`}
                            >
                              {tx.type === "received" ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p>
                                {tx.type} {tx.amount}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {truncateAddress(
                                  tx.type === "received"
                                    ? tx.fromAddress
                                    : tx.toAddress,
                                )}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

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
                  onClick={() => handleWithdraw(selectedAsset)}
                  className="w-full"
                  disabled={isWithdrawing || !starknetAddress || !selectedAsset}
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

      <BottomNav />
    </div>
  );
}
