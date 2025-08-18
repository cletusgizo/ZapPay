import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { 
  ArrowLeft, 
  Zap,
  Shield,
  Globe,
  Users,
  Code,
  ExternalLink,
  CheckCircle,
  FileText,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Convert crypto to Naira and transfer to your bank in seconds"
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Built on StarkNet with enterprise-level security protocols"
  },
  {
    icon: Globe,
    title: "Global Ready",
    description: "Starting with Nigeria, expanding to USD and EUR markets"
  },
  {
    icon: Users,
    title: "Business Focused",
    description: "Designed for Nigerian merchants and tech-savvy professionals"
  }
];

const contractAddresses = [
  {
    name: "ZapPay Main Contract",
    address: "0x742d35Cc6C4C8B9A5A1f67E8F2D3B9C1A7E5F8G2",
    network: "StarkNet Mainnet"
  },
  {
    name: "USDC Payment Processor",
    address: "0x456A8B2c9D1E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S",
    network: "StarkNet Mainnet"
  },
  {
    name: "ETH Payment Handler",
    address: "0x789C4D3e1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U",
    network: "StarkNet Mainnet"
  }
];

const auditReports = [
  {
    auditor: "OpenZeppelin",
    date: "December 2023",
    status: "Passed",
    score: "A+"
  },
  {
    auditor: "ConsenSys Diligence",
    date: "November 2023", 
    status: "Passed",
    score: "A"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
            <Link to="/profile">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold">About ZapPay</h1>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">The Future of Crypto Payments</h2>
          <p className="text-sm opacity-90">
            Bridging the gap between crypto and traditional finance in Nigeria
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Brand Story */}
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                ZapPay was born from a simple vision: making crypto payments as easy as sending a text message. 
                Founded in Lagos in 2023, we recognized that Nigerian businesses needed a seamless way to accept 
                cryptocurrency while still receiving familiar Naira in their bank accounts.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built on StarkNet's cutting-edge technology, ZapPay eliminates the complexity of crypto transactions 
                while maintaining the speed and security that modern businesses demand.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle>What Makes Us Different</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security & Audits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Transparency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Security Audits</h3>
                <div className="space-y-2">
                  {auditReports.map((audit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{audit.auditor}</p>
                        <p className="text-xs text-muted-foreground">{audit.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {audit.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Score: {audit.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Full Security Report
              </Button>
            </CardContent>
          </Card>

          {/* Smart Contract Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Smart Contracts
              </CardTitle>
              <CardDescription>
                All our smart contracts are open source and audited
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contractAddresses.map((contract, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{contract.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {contract.network}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {contract.address}
                  </p>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on StarkScan
              </Button>
            </CardContent>
          </Card>

          {/* Version Info */}
          <Card>
            <CardHeader>
              <CardTitle>Version Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold text-primary">v2.1.0</p>
                  <p className="text-xs text-muted-foreground">App Version</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold text-primary">10,000+</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Last updated: January 15, 2024
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Legal & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Cookie Policy
              </Button>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Licensed by the Central Bank of Nigeria
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Get Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                Contact Support Team
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Email: support@zappay.ng</p>
                <p>Phone: +234 700 ZAP-PAY</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
