import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type {
  RetailerListResponse,
  RetailerResponse,
  ProductListResponse,
  ProductResponse,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CartLine {
  product: ProductResponse;
  qty: number;
}

export default function ManualOrderPage() {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState<RetailerResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetailerId, setSelectedRetailerId] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<RetailerListResponse>("/retailers"),
      api.get<ProductListResponse>("/products"),
    ])
      .then(([retRes, prodRes]) => {
        setRetailers(retRes.data.items.filter((r) => r.is_active));
        setProducts(prodRes.data.items.filter((p) => p.is_active));
      })
      .catch(() => toast.error("Failed to load retailers/products"))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    const existing = cart.find((c) => c.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.product.id === product.id ? { ...c, qty: c.qty + addQty } : c
        )
      );
    } else {
      setCart([...cart, { product, qty: addQty }]);
    }
    setSelectedProductId("");
    setAddQty(1);
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map((c) => (c.product.id === productId ? { ...c, qty } : c)));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((c) => c.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, c) => sum + Number(c.product.price) * c.qty,
    0
  );

  const placeManualOrder = async () => {
    if (!selectedRetailerId || cart.length === 0) return;
    setPlacing(true);
    setError("");
    try {
      await api.post("/orders/manual", {
        retailer_id: selectedRetailerId,
        items: cart.map((c) => ({ product_id: c.product.id, qty: c.qty })),
      });
      toast.success("Manual order placed successfully");
      navigate("/invoices");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to place order.";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate("/invoices")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Invoices
      </Button>

      <h1 className="text-2xl font-semibold mb-6">Create Manual Order</h1>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Select Retailer */}
        <div className="space-y-1 max-w-md">
          <label className="text-sm font-medium">Retailer</label>
          <Select value={selectedRetailerId} onValueChange={setSelectedRetailerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a retailer">
                {selectedRetailerId
                  ? (() => {
                      const r = retailers.find((r) => r.id === selectedRetailerId);
                      return r ? `${r.shop_name} — ${r.user_name} (${r.user_phone})` : "Select a retailer";
                    })()
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {retailers.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.shop_name} — {r.user_name} ({r.user_phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Products */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Add Product</label>
          <div className="flex gap-2 max-w-2xl">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder="Select a product">
                  {selectedProductId
                    ? (() => {
                        const p = products.find((p) => p.id === selectedProductId);
                        return p ? `${p.name} — ₹${Number(p.price).toLocaleString("en-IN")} (stock: ${p.stock})` : "Select a product";
                      })()
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ₹{Number(p.price).toLocaleString("en-IN")} (stock: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={addQty}
              onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
              className="w-20"
              placeholder="Qty"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={addToCart}
              disabled={!selectedProductId}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        {cart.length > 0 && (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-24 text-center">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((c) => (
                  <TableRow key={c.product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {c.product.pic_url ? (
                          <img src={c.product.pic_url} alt={c.product.name} className="h-8 w-8 rounded object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted shrink-0" />
                        )}
                        {c.product.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{Number(c.product.price).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={c.qty}
                        onChange={(e) =>
                          updateCartQty(c.product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-20 text-center mx-auto"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(Number(c.product.price) * c.qty).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(c.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary & Submit */}
        {cart.length > 0 && (
          <Card className="max-w-sm ml-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Items</span>
                <span>{cart.reduce((s, c) => s + c.qty, 0)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Estimated Total</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <Button
                className="w-full"
                onClick={placeManualOrder}
                disabled={!selectedRetailerId || cart.length === 0 || placing}
              >
                {placing ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
