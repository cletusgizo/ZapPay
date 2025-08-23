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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  ArrowLeft,
  Copy,
  Share,
  CheckCircle,
  Loader2,
  Wallet,
  AlertCircle,
  Wifi,
  WifiOff,
  Send,
  ArrowUpRight,
  History,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Account,
  constants,
  ec,
  stark,
  RpcProvider,
  hash,
  CallData,
  num,
} from "starknet";
import { ethers } from "ethers";
import { getUserId, generateStarknetAddress, snKeys } from "@/lib/session";

// Mock BottomNav component
const BottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
    <div className="text-center text-sm text-muted-foreground">
      Bottom Navigation
    </div>
  </div>
);

// Cryptocurrency options with contract addresses
const cryptoOptions = [
  {
    value: "eth",
    label: "Ethereum (ETH)",
    rate: 1700000,
    network: "starknet",
    contractAddress:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
    icon: "🔷",
  },
  {
    value: "strk",
    label: "StarkNet (STRK)",
    rate: 60,
    network: "starknet",
    contractAddress:
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    decimals: 18,
    icon: "⭐",
  },
  {
    value: "usdc",
    label: "USDC",
    rate: 750,
    network: "starknet",
    contractAddress:
      "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    decimals: 6,
    icon: "💵",
  },
];

// Types for wallet response
interface WalletResponse {
  address: string;
  publicKey: string;
  chainId: string;
  network: string;
}

interface QRCodeProps {
  value: string;
  size?: number;
}

interface SendTransaction {
  hash: string;
  to: string;
  amount: string;
  token: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  gasUsed?: string;
}

// Simple QR Code component
const QRCodeGenerator: React.FC<QRCodeProps> = ({ value, size = 200 }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrSize = size;
    const moduleSize = qrSize / 25;

    canvas.width = qrSize;
    canvas.height = qrSize;

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, qrSize, qrSize);

      ctx.fillStyle = "#000000";
      const hash = value.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          const shouldFill = (hash + i * 25 + j) % 3 === 0;
          if (shouldFill) {
            ctx.fillRect(
              i * moduleSize,
              j * moduleSize,
              moduleSize,
              moduleSize,
            );
          }
        }
      }

      const cornerSize = moduleSize * 3;
      [
        [0, 0],
        [0, 22],
        [22, 0],
      ].forEach(([x, y]) => {
        ctx.fillStyle = "#000000";
        ctx.fillRect(x * moduleSize, y * moduleSize, cornerSize, cornerSize);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          (x + 1) * moduleSize,
          (y + 1) * moduleSize,
          moduleSize,
          moduleSize,
        );
      });

      setQrDataUrl(canvas.toDataURL());
    }
  }, [value, size]);

  return qrDataUrl ? (
    <img
      src={qrDataUrl}
      alt="QR Code"
      className="border-2 border-gray-200 rounded-lg"
      width={size}
      height={size}
    />
  ) : (
    <div
      className="border-2 border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
};

export default function Payments() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "receive";

  // State management
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCrypto, setSelectedCrypto] = useState("eth");
  const [nairaAmount, setNairaAmount] = useState("");
  const [autoConvert, setAutoConvert] = useState(true);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  // Send functionality state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [walletBalance, setWalletBalance] = useState<Record<string, string>>(
    {},
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sendTransactions, setSendTransactions] = useState<SendTransaction[]>(
    [],
  );
  const [provider, setProvider] = useState<RpcProvider | null>(null);

  const selectedCryptoData = cryptoOptions.find(
    (crypto) => crypto.value === selectedCrypto,
  );
  const cryptoAmount =
    nairaAmount && selectedCryptoData
      ? (parseFloat(nairaAmount) / selectedCryptoData.rate).toFixed(6)
      : "";

  const sendCryptoAmount =
    sendAmount && selectedCryptoData ? parseFloat(sendAmount).toString() : "";

  const sendNairaValue =
    sendAmount && selectedCryptoData
      ? (parseFloat(sendAmount) * selectedCryptoData.rate).toFixed(2)
      : "";

  // Check Starknet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const rpcProvider = new RpcProvider({
          nodeUrl: "https://starknet-mainnet.public.blastapi.io",
        });
        await rpcProvider.getChainId();
        setProvider(rpcProvider);
        setIsConnected(true);
        setConnectionStatus("connected");
        await fetchBalances(rpcProvider);
      } catch (error) {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        console.error("Starknet connection failed:", error);
      }
    };

    checkConnection();
  }, []);

  // Fetch wallet balances
  const fetchBalances = async (rpcProvider: RpcProvider) => {
    try {
      const userId = getUserId();
      const address = localStorage.getItem(snKeys.address(userId));

      if (!address) return;

      const balances: Record<string, string> = {};

      for (const crypto of cryptoOptions) {
        try {
          let balance: bigint;

          if (crypto.value === "eth") {
            const ethBalance = await rpcProvider.getBalance(address);
            balance = BigInt(ethBalance.toString());
          } else {
            const res = await rpcProvider.callContract({
              contractAddress: crypto.contractAddress!,
              entrypoint: "balanceOf",
              calldata: CallData.compile({ user: address }),
            });
            const low = num.toBigInt(res[0]);
            const high = num.toBigInt(res[1]);
            balance = high * BigInt(2) ** BigInt(128) + low;
          }

          const balanceNum = Number(balance) / Math.pow(10, crypto.decimals);
          balances[crypto.value] = balanceNum.toFixed(6);
        } catch (error) {
          console.error(`Error fetching ${crypto.value} balance:`, error);
          balances[crypto.value] = "0";
        }
      }

      setWalletBalance(balances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  // Get user-specific wallet address
  const getUserWalletAddress = async (): Promise<string> => {
    try {
      const userId = getUserId();
      const storedAddress = localStorage.getItem(snKeys.address(userId));

      if (storedAddress) {
        return storedAddress;
      }

      const walletData = await generateStarknetAddress();
      localStorage.setItem(snKeys.address(userId), walletData.address);
      return walletData.address;
    } catch (error) {
      console.error("Error getting user wallet address:", error);
      throw new Error("Failed to get wallet address");
    }
  };

  // Generate QR for receiving payments
  const generateQR = async () => {
    if (!nairaAmount) {
      setError("Please enter an amount");
      return;
    }

    if (!isConnected) {
      setError("Wallet service is not available");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const address = await getUserWalletAddress();
      setWalletAddress(address);
      setShowQRDialog(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to get wallet address`;
      setError(errorMessage);
      console.error("Wallet address error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Validate send form
  const validateSendForm = (): boolean => {
    setSendError("");

    if (!recipientAddress) {
      setSendError("Please enter recipient address");
      return false;
    }

    if (!recipientAddress.startsWith("0x") || recipientAddress.length < 60) {
      setSendError("Invalid Starknet address format");
      return false;
    }

    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      setSendError("Please enter a valid amount");
      return false;
    }

    const balance = parseFloat(walletBalance[selectedCrypto] || "0");
    const amount = parseFloat(sendAmount);

    if (amount > balance) {
      setSendError(
        `Insufficient balance. Available: ${balance} ${selectedCrypto.toUpperCase()}`,
      );
      return false;
    }

    return true;
  };

  // Handle send transaction
  const handleSend = async () => {
    if (!validateSendForm()) return;
    setShowConfirmDialog(true);
  };

  // Execute send transaction
  const executeSend = async () => {
    if (!provider || !selectedCryptoData) return;

    setIsSending(true);
    setSendError("");
    setShowConfirmDialog(false);

    try {
      // This is a mock transaction for demo purposes
      // In a real implementation, you would:
      // 1. Create Account from private key
      // 2. Execute transfer transaction
      // 3. Wait for confirmation

      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      const newTransaction: SendTransaction = {
        hash: mockTxHash,
        to: recipientAddress,
        amount: `${sendAmount} ${selectedCrypto.toUpperCase()}`,
        token: selectedCrypto.toUpperCase(),
        timestamp: Date.now(),
        status: "pending",
      };

      setSendTransactions((prev) => [newTransaction, ...prev]);

      // Simulate transaction processing
      setTimeout(() => {
        setSendTransactions((prev) =>
          prev.map((tx) =>
            tx.hash === mockTxHash
              ? { ...tx, status: "completed", gasUsed: "0.001 ETH" }
              : tx,
          ),
        );
        // Refresh balances after successful transaction
        if (provider) fetchBalances(provider);
      }, 5000);

      // Reset form
      setRecipientAddress("");
      setSendAmount("");
    } catch (error) {
      console.error("Send transaction failed:", error);
      setSendError(
        error instanceof Error ? error.message : "Transaction failed",
      );
    } finally {
      setIsSending(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const sharePayment = async () => {
    const shareData = {
      title: `Payment Request - ₦${nairaAmount}`,
      text: `Pay ₦${nairaAmount} (≈ ${cryptoAmount} ${selectedCrypto.toUpperCase()}) to: ${walletAddress}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `Payment Request: ₦${nairaAmount} (≈ ${cryptoAmount} ${selectedCrypto.toUpperCase()})\nAddress: ${walletAddress}`,
        );
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  const closeQRDialog = () => {
    setShowQRDialog(false);
    setWalletAddress("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-4 sm:bg-card sm:text-inherit bg-blue-600 text-white">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 sm:text-inherit text-blue-600" />
          </Button>
          <h1 className="text-xl font-semibold">Payments</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <div className="max-w-md mx-auto">
          {/* Connection Status */}
          <Card
            className={`mb-6 ${connectionStatus === "connected" ? "border-green-200" : connectionStatus === "disconnected" ? "border-red-200" : "border-gray-200"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {connectionStatus === "checking" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Checking connection...
                    </span>
                  </>
                ) : connectionStatus === "connected" ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Connected to Starknet Mainnet
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      Network connection failed
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receive">Receive</TabsTrigger>
              <TabsTrigger value="send">Send</TabsTrigger>
            </TabsList>

            {/* Receive Tab */}
            <TabsContent value="receive" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Receive Crypto Payment
                  </CardTitle>
                  <CardDescription>
                    Generate a wallet address with automatic Naira conversion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Cryptocurrency</Label>
                    <Select
                      value={selectedCrypto}
                      onValueChange={setSelectedCrypto}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoOptions.map((crypto) => (
                          <SelectItem key={crypto.value} value={crypto.value}>
                            <div className="flex items-center gap-2">
                              <span>{crypto.icon}</span>
                              {crypto.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount in Naira (NGN)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount in NGN"
                      value={nairaAmount}
                      onChange={(e) => setNairaAmount(e.target.value)}
                    />
                    {cryptoAmount && (
                      <p className="text-sm text-muted-foreground">
                        ≈ {cryptoAmount} {selectedCrypto.toUpperCase()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Auto-convert to Bank</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically transfer to your linked account
                      </p>
                    </div>
                    <Switch
                      checked={autoConvert}
                      onCheckedChange={setAutoConvert}
                    />
                  </div>

                  {autoConvert && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Bank Account: GTBank ****1234
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={generateQR}
                    className="w-full"
                    disabled={!nairaAmount || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Wallet...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Send Tab */}
            <TabsContent value="send" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Cryptocurrency
                  </CardTitle>
                  <CardDescription>
                    Send crypto from your wallet to another address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Token Selection */}
                  <div className="space-y-2">
                    <Label>Select Cryptocurrency</Label>
                    <Select
                      value={selectedCrypto}
                      onValueChange={setSelectedCrypto}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoOptions.map((crypto) => (
                          <SelectItem key={crypto.value} value={crypto.value}>
                            <div className="flex items-center gap-2">
                              <span>{crypto.icon}</span>
                              <div className="flex flex-col">
                                <span>{crypto.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  Balance: {walletBalance[crypto.value] || "0"}{" "}
                                  {crypto.value.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipient Address */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="sendAmount">Amount</Label>
                      <span className="text-sm text-muted-foreground">
                        Balance: {walletBalance[selectedCrypto] || "0"}{" "}
                        {selectedCrypto.toUpperCase()}
                      </span>
                    </div>
                    <Input
                      id="sendAmount"
                      type="number"
                      step="any"
                      placeholder={`Enter amount in ${selectedCrypto.toUpperCase()}`}
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                    {sendNairaValue && (
                      <p className="text-sm text-muted-foreground">
                        ≈ ₦{sendNairaValue}
                      </p>
                    )}
                  </div>

                  {/* Max Button */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSendAmount(walletBalance[selectedCrypto] || "0")
                      }
                      disabled={!walletBalance[selectedCrypto]}
                    >
                      Max
                    </Button>
                  </div>

                  {/* Error Display */}
                  {sendError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{sendError}</span>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <Button
                    onClick={handleSend}
                    className="w-full"
                    disabled={
                      !recipientAddress ||
                      !sendAmount ||
                      isSending ||
                      !isConnected
                    }
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send {selectedCrypto.toUpperCase()}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Transaction History */}
              {sendTransactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sendTransactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.hash}
                        className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() =>
                          window.open(
                            `https://starkscan.co/tx/${tx.hash}`,
                            "_blank",
                          )
                        }
                      >
                        <div
                          className={`p-2 rounded-full ${tx.status === "completed" ? "bg-green-100 text-green-600" : tx.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">Sent {tx.amount}</p>
                              <p className="text-sm text-muted-foreground">
                                To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-xs px-2 py-1 rounded ${tx.status === "completed" ? "bg-green-100 text-green-600" : tx.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                              >
                                {tx.status}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={closeQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex justify-center items-center">
              <QRCodeGenerator
                value={`${selectedCrypto}:${walletAddress}?amount=${cryptoAmount}&label=Payment Request ₦${nairaAmount}`}
                size={240}
              />
            </div>

            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">₦{nairaAmount}</p>
              <p className="text-sm text-muted-foreground">
                ≈ {cryptoAmount} {selectedCrypto.toUpperCase()}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Wallet Address
                </Label>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-mono text-sm break-all">{walletAddress}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyAddress}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={sharePayment}
                  className="flex-1"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {autoConvert && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Auto-convert enabled to GTBank ****1234
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                Send {selectedCrypto.toUpperCase()}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    {sendAmount} {selectedCrypto.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NGN Value:</span>
                  <span className="font-semibold">₦{sendNairaValue}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono text-sm">
                    {recipientAddress.slice(0, 10)}...
                    {recipientAddress.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>Starknet Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Gas:</span>
                  <span className="text-sm">~0.001 ETH</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Please confirm the details</p>
                    <p>This transaction cannot be reversed once confirmed.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={executeSend}
                disabled={isSending}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Confirm Send"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
