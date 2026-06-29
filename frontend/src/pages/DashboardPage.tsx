import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/widgets/sidebar/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/atoms/card";
import { Users, DollarSign, Clock, Calendar } from "lucide-react";

function trialDaysLeft(trialEndsAt?: string): string {
  if (!trialEndsAt) return "—";
  const days = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000);
  return days > 0 ? `${days}d` : "Expired";
}

interface StatCardProps { title: string; value: string; icon: React.ReactNode }
function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-[var(--color-brand)] opacity-70">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { company } = useAuth();

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-6 bg-[hsl(var(--card))]" style={{ borderColor: "hsl(var(--border))" }}>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 p-6 space-y-6" data-testid="dashboard-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Employees" value="—" icon={<Users className="h-4 w-4" />} />
            <StatCard title="Payroll (period)" value="—" icon={<DollarSign className="h-4 w-4" />} />
            <StatCard title="Pending approvals" value="—" icon={<Clock className="h-4 w-4" />} />
            <StatCard title="Trial days left" value={trialDaysLeft(company?.trialEndsAt)} icon={<Calendar className="h-4 w-4" />} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">No recent activity yet.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Coming soon.</p></CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
