import { useState } from "react";
import api from "@/lib/api";
import type { InvoiceResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown, Search } from "lucide-react";

export default function RetailerInvoicesPage() {
  const [invoiceId, setInvoiceId] = useState("");
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookupInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId.trim()) return;
    setLoading(true);
    setError("");
    setInvoice(null);
    try {
      const res = await api.get<InvoiceResponse>(`/invoices/${invoiceId.trim()}`);
      setInvoice(res.data);
    } catch {
      setError("Invoice not found.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = (id: string) => {
    const token = localStorage.getItem("access_token");
    window.open(`/api/v1/invoices/${id}/pdf?token=${token}`, "_blank");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Invoices</h1>

      <form onSubmit={lookupInvoice} className="flex items-end gap-3 mb-6 max-w-md">
        <div className="flex-1 space-y-2">
          <Label>Invoice ID</Label>
          <Input
            placeholder="Paste invoice ID"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4 mr-1" />
          {loading ? "..." : "Look up"}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      {invoice && (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                <TableCell className="font-mono text-xs">
                  {invoice.order_id.slice(0, 8)}...
                </TableCell>
                <TableCell className="text-right">
                  ₹{Number(invoice.total).toLocaleString("en-IN")}
                </TableCell>
                <TableCell>
                  {new Date(invoice.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.pdf_path && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadPdf(invoice.id)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
