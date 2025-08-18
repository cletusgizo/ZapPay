import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ArrowLeft, 
  User,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  CheckCircle,
  AlertCircle,
  Settings,
  MessageSquare,
  FileText,
  Info
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function Profile() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "business-info";
  
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "TechCorp Solutions",
    email: "john@techcorp.com",
    phone: "+234 800 123 4567",
    country: "ng"
  });
  
  const [bankAccount, setBankAccount] = useState({
    bankName: "GTBank",
    accountNumber: "1234567890",
    accountName: "TechCorp Solutions"
  });

  const [notifications, setNotifications] = useState({
    payments: true,
    transfers: true,
    security: true,
    marketing: false
  });

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
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="business-info">Business</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Business Info Tab */}
            <TabsContent value="business-info" className="space-y-6 mt-6">
              {/* KYC Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    KYC Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Verification Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Your account is fully verified
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessInfo.businessName}
                      onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={businessInfo.country} onValueChange={(value) => setBusinessInfo({...businessInfo, country: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ng">Nigeria</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="gb">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>

              {/* Bank Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Bank Account Details
                  </CardTitle>
                  <CardDescription>
                    For automatic Naira transfers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Select value={bankAccount.bankName} onValueChange={(value) => setBankAccount({...bankAccount, bankName: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GTBank">GTBank</SelectItem>
                        <SelectItem value="Access Bank">Access Bank</SelectItem>
                        <SelectItem value="First Bank">First Bank</SelectItem>
                        <SelectItem value="UBA">UBA</SelectItem>
                        <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankAccount.accountNumber}
                      onChange={(e) => setBankAccount({...bankAccount, accountNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={bankAccount.accountName}
                      onChange={(e) => setBankAccount({...bankAccount, accountName: e.target.value})}
                      disabled
                    />
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Bank account verified</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">Update Bank Details</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Auto-convert to Naira</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically convert incoming crypto
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Currency</Label>
                    <Select defaultValue="ngn">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngn">Nigerian Naira (NGN)</SelectItem>
                        <SelectItem value="usd">US Dollar (USD)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>

                  <Button variant="outline" className="w-full">
                    Re-link Wallet
                  </Button>
                </CardContent>
              </Card>

              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Payment Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive payments
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.payments}
                      onCheckedChange={(checked) => setNotifications({...notifications, payments: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Transfer Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about bank transfers
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.transfers}
                      onCheckedChange={(checked) => setNotifications({...notifications, transfers: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Important security notifications
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.security}
                      onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Marketing & Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Product updates and promotions
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* API Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    API Integration
                  </CardTitle>
                  <CardDescription>
                    Integrate ZapPay into your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View API Documentation
                  </Button>
                </CardContent>
              </Card>

              {/* Support & Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Support & Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    FAQ
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Live Chat
                  </Button>

                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/about">
                      <Info className="w-4 h-4 mr-2" />
                      About ZapPay
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Sign Out */}
              <Card>
                <CardContent className="p-4">
                  <Button variant="destructive" className="w-full" asChild>
                    <Link to="/">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
