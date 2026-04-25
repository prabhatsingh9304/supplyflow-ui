import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { OrderListResponse, OrderResponse, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  pending: "outline",
  accepted: "default",
  packed: "secondary",
  dispatched: "secondary",
  delivered: "default",
  cancelled: "secondary",
};

export default function RetailerOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<OrderListResponse>("/orders")
      .then((r) => setOrders(r.data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/my-orders/${o.id}`)}
                >
                  <TableCell className="font-mono text-xs">
                    {o.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {new Date(o.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/my-orders/${o.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
