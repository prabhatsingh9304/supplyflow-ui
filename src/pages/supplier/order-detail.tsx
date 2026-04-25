import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { OrderResponse, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const allStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = () => {
    api
      .get<OrderResponse>(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateStatus = async (status: OrderStatus) => {
    setUpdating(true);
    try {
      const r = await api.patch<OrderResponse>(`/orders/${id}/status`, { status });
      setOrder(r.data);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!order) return <p className="text-muted-foreground">Order not found.</p>;

  const isSupplier = user?.role === "supplier";

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(isSupplier ? "/orders" : "/my-orders")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order Detail</h1>
          <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {order.status}
        </Badge>
      </div>

      {isSupplier && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Update Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Select
              value={order.status}
              onValueChange={(v) => updateStatus(v as OrderStatus)}
              disabled={updating}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updating && <span className="text-sm text-muted-foreground">Updating...</span>}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Subtotal</span>
              <p className="font-medium">₹{Number(order.subtotal).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tax</span>
              <p className="font-medium">₹{Number(order.tax).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total</span>
              <p className="font-bold">₹{Number(order.total).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date</span>
              <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{(Number(item.price) * item.qty).toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
