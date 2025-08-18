import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  Users,
  Bell,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const todayStats = {
  totalReceived: "₦450,000",
  transactionCount: 12,
  averageAmount: "₦37,500"
};

const weeklyData = [
  { day: "Mon", amount: 85000 },
  { day: "Tue", amount: 120000 },
  { day: "Wed", amount: 95000 },
  { day: "Thu", amount: 180000 },
  { day: "Fri", amount: 220000 },
  { day: "Sat", amount: 150000 },
  { day: "Sun", amount: 110000 }
];

const recentNotifications = [
  {
    id: "1",
    type: "payment",
    message: "Payment of ₦125,000 received and transferred to GTBank",
    time: "5 mins ago",
    status: "completed"
  },
  {
    id: "2",
    type: "transfer",
    message: "Bank transfer of ₦85,000 initiated",
    time: "1 hour ago",
    status: "pending"
  },
  {
    id: "3",
    type: "settings",
    message: "Auto-convert settings updated",
    time: "2 hours ago",
    status: "completed"
  }
];

export default function Business() {
  return (
    <div className="min-h-screen lg:min-h-screen min-h-[745px] bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Business Hub</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Today's Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Today's Performance
              </CardTitle>
              <CardDescription>
                Your business metrics for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{todayStats.totalReceived}</p>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{todayStats.transactionCount}</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{todayStats.averageAmount}</p>
                  <p className="text-sm text-muted-foreground">Average</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-24 mb-2">
                {weeklyData.map((data, index) => (
                  <div key={data.day} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-6 bg-primary rounded-t"
                      style={{ 
                        height: `${(data.amount / Math.max(...weeklyData.map(d => d.amount))) * 80}px`,
                        minHeight: '8px'
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{data.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Total this week: ₦{weeklyData.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>



          {/* Bank Transfer Notifications */}
          <Card>
            <CardHeader className="lg:mt-0 -mt-1">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="lg:mt-0 -mt-1">
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.status === "completed" 
                        ? "bg-green-100 dark:bg-green-900" 
                        : "bg-orange-100 dark:bg-orange-900"
                    }`}>
                      {notification.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
