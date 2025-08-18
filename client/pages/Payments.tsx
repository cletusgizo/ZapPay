import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import {
  QrCode,
  ArrowLeft,
  Copy,
  Share,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const cryptoOptions = [
  { value: "eth", label: "Ethereum (ETH)", rate: 1700000 },
  { value: "strk", label: "StarkNet (STRK)", rate: 60 },
  { value: "usdc", label: "USDC", rate: 750 },
  { value: "btc", label: "Bitcoin (BTC)", rate: 50000000 }
];

export default function Payments() {
  // Receive state
  const [selectedCrypto, setSelectedCrypto] = useState("eth");
  const [nairaAmount, setNairaAmount] = useState("");
  const [autoConvert, setAutoConvert] = useState(true);
  const [qrGenerated, setQrGenerated] = useState(false);

  const selectedCryptoData = cryptoOptions.find(crypto => crypto.value === selectedCrypto);
  const cryptoAmount = nairaAmount ? (parseFloat(nairaAmount) / selectedCryptoData!.rate).toFixed(6) : "";

  const generateQR = () => {
    setQrGenerated(true);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText("0x742d35Cc6C4C...8B9A5A1f");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-4 sm:bg-card sm:text-inherit bg-blue-600 text-white">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home">
              <ArrowLeft className="w-5 h-5 sm:text-inherit text-white" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Payments</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Receive Crypto Payment
                  </CardTitle>
                  <CardDescription>
                    Generate a payment request with automatic Naira conversion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Cryptocurrency</Label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoOptions.map(crypto => (
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
                    <Switch checked={autoConvert} onCheckedChange={setAutoConvert} />
                  </div>

                  {autoConvert && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Bank Account: GTBank ****1234</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={generateQR} 
                    className="w-full" 
                    disabled={!nairaAmount}
                  >
                    Generate QR Code
                  </Button>
                </CardContent>
              </Card>

              {qrGenerated && (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg mx-auto flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-1">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold">Payment Request for ₦{nairaAmount}</p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {cryptoAmount} {selectedCrypto.toUpperCase()}
                      </p>
                    </div>

                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-mono break-all">0x742d35Cc6C4C...8B9A5A1f</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={copyAddress} className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Address
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
