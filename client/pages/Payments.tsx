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
  RefreshCw,
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
} from "starknet";
import { ethers } from "ethers";
import { getUserId, generateStarknetAddress, snKeys, getOrCreateWallet } from "@/lib/session";
import { useAutoSwap } from "@/lib/useAutoSwap";

// Mock BottomNav component
const BottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
    <div className="text-center text-sm text-muted-foreground">
      Bottom Navigation
    </div>
  </div>
);

// Cryptocurrency options
const cryptoOptions = [
  { value: "eth", label: "Ethereum (ETH)", rate: 1700000, network: "ethereum" },
  { value: "strk", label: "StarkNet (STRK)", rate: 60, network: "starknet" },
  { value: "usdc", label: "USDC", rate: 750, network: "ethereum" },
];

// Types for wallet response
interface WalletResponse {
  address: string;
  publicKey: string;
  privateKey: string;
  chainId: string;
  network: string;
}

interface QRCodeProps {
  value: string;
  size?: number;
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
  // State management
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
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  
  // Send/Withdraw state
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");
  
  // Tab handling
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "receive";

  // Auto-swap functionality
  const {
    isSwapping,
    swapSuccess,
    swapError,
    txHash,
    executeAutoSwap,
    resetSwapState,
  } = useAutoSwap();

  const selectedCryptoData = cryptoOptions.find(
    (crypto) => crypto.value === selectedCrypto,
  );
  const cryptoAmount =
    nairaAmount && selectedCryptoData
      ? (parseFloat(nairaAmount) / selectedCryptoData.rate).toFixed(6)
      : "";

  // Check Starknet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const provider = new RpcProvider({
          nodeUrl: "https://starknet-mainnet.public.blastapi.io",
        });
        await provider.getChainId(); // Test connection
        console.log("Provider", provider);

        setIsConnected(true);
        setConnectionStatus("connected");
      } catch (error) {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        console.error("Starknet connection failed:", error);
      }
    };

    checkConnection();
  }, []);

  // Get user-specific wallet address
  const getUserWalletAddress = async (): Promise<string> => {
    try {
      const userId = getUserId();
      
      // Use the existing getOrCreateWallet function which handles both generation and storage
      const walletData = await getOrCreateWallet(userId);
      
      console.log("🔑 Wallet Information:");
      console.log("Address:", walletData.address);
      console.log("Public Key:", walletData.publicKey);
      console.log("PrivateKey:", walletData.privateKey);
      
      return walletData.address;
    } catch (error) {
      console.error("Error getting user wallet address:", error);
      throw new Error("Failed to get wallet address");
    }
  };

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

      // Auto-swap STRK to USDC if auto-convert is enabled
      // Note: Auto-swap is now manually triggered by the user in the QR dialog
      if (autoConvert && selectedCrypto === "strk") {
        console.log("Auto-convert enabled for STRK payments");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to get wallet address`;
      setError(errorMessage);
      console.error("Wallet address error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopyStatus("copied");
      // Reset the copy status after 2 seconds
      setTimeout(() => setCopyStatus("idle"), 2000);
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
  
  const switchTab = (tab: string) => {
    setSearchParams({ tab });
  };
  
  const sendCrypto = async () => {
    if (!sendAddress || !sendAmount) {
      setSendError("Please enter recipient address and amount");
      return;
    }
    
    if (!isConnected) {
      setSendError("Wallet service is not available");
      return;
    }
    
    setIsSending(true);
    setSendError("");
    setSendSuccess(false);
    
    try {
      // Get user's wallet data
      const userId = getUserId();
      const walletData = await getOrCreateWallet(userId);
      
      // In a real implementation, we would:
      // 1. Create a StarkNet account instance with the private key
      // 2. Prepare the transaction
      // 3. Sign and send the transaction
      // 4. Handle the response
      
      // For now, we'll simulate the sending process
      console.log("Sending crypto...");
      console.log("From:", walletData.address);
      console.log("To:", sendAddress);
      console.log("Amount:", sendAmount);
      console.log("Crypto:", selectedCrypto);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful send
      setSendSuccess(true);
      setSendAddress("");
      setSendAmount("");
      
      // Reset success status after 5 seconds
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to send crypto`;
      setSendError(errorMessage);
      console.error("Send error:", err);
    } finally {
      setIsSending(false);
    }
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
          <div className="space-y-6 mt-6">
            {/* Connection Status */}
            <Card
              className={`${connectionStatus === "connected" ? "border-green-200" : connectionStatus === "disconnected" ? "border-red-200" : "border-gray-200"}`}
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
                        Connected to wallet service
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        Wallet service unavailable
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Main Payment Card */}
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
                          {crypto.label}
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
                        Auto-convert enabled: STRK → USDC → Bank
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
          </div>
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
                  {copyStatus === "copied" ? "Copied!" : "Copy"}
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
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Auto-convert enabled to GTBank ****1234
                    </span>
                  </div>
                </div>

                {/* Manual Auto-swap Trigger */}
                {selectedCrypto === "strk" && swapSuccess === null && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={executeAutoSwap}
                      disabled={isSwapping}
                      className="w-full"
                    >
                      {isSwapping ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Swapping STRK to USDC...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Auto-swap STRK to USDC
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Convert your STRK to USDC for automatic bank transfer
                    </p>
                  </div>
                )}

                {/* Auto-swap status */}
                {selectedCrypto === "strk" && (
                  <>
                    {isSwapping && swapSuccess === null && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">
                            Auto-swapping STRK to USDC...
                          </span>
                        </div>
                      </div>
                    )}

                    {swapSuccess === true && txHash && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            STRK successfully swapped to USDC
                          </span>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() =>
                              window.open(
                                `https://starkscan.co/tx/${txHash}`,
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

                    {swapSuccess === false && swapError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Auto-swap failed: {swapError}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
