import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type {
  OrderListResponse,
  OrderResponse,
  OrderStatus,
  InvoiceResponse,
} from "@/types";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  pending: "outline",
  accepted: "default",
  packed: "secondary",
  dispatched: "secondary",
  delivered: "default",
  cancelled: "secondary",
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchOrders = () => {
    api
      .get<OrderListResponse>("/orders")
      .then((r) => {
        setOrders(r.data.items);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const generateInvoice = async (orderId: string) => {
    setGeneratingId(orderId);
    try {
      const res = await api.post<InvoiceResponse>(
        `/invoices/${orderId}/generate`
      );
      toast.success(`Invoice ${res.data.invoice_no} generated`);
      const pdf = await api.get(`/invoices/${res.data.id}/pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(pdf.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${res.data.invoice_no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to generate invoice. Order must be accepted or delivered.");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manual Invoices</h1>
          <p className="text-sm text-muted-foreground">{total} manual orders total</p>
        </div>
        <Button size="sm" onClick={() => navigate("/invoices/new")}>
          <Plus className="h-4 w-4 mr-1" /> New Manual Order
        </Button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/orders/${o.id}`)}
                >
                  <TableCell className="font-medium">
                    {o.retailer_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.retailer_phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[150px] truncate" title={o.retailer_address}>
                    {o.retailer_address}
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
                  <TableCell className="text-right space-x-1">
                    {(o.status === "accepted" || o.status === "delivered") && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={generatingId === o.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateInvoice(o.id);
                                }}
                              />
                            }
                          >
                            <FileText className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Generate Invoice</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${o.id}`);
                      }}
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
