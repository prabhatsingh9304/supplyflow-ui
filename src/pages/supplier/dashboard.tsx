import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { DashboardResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardResponse>("/analytics/dashboard")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Failed to load dashboard.</p>;

  const stats = [
    { label: "Total Retailers", value: data.total_retailers, icon: Users },
    { label: "Total Products", value: data.total_products, icon: Package },
    { label: "Total Orders", value: data.total_orders, icon: ShoppingCart },
    {
      label: "Total Revenue",
      value: `₹${Number(data.total_revenue).toLocaleString("en-IN")}`,
      icon: DollarSign,
    },
    { label: "Pending Orders", value: data.pending_orders, icon: Clock },
    { label: "Delivered Orders", value: data.delivered_orders, icon: CheckCircle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
