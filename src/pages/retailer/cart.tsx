import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { ProductResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface CartItem {
  product: ProductResponse;
  qty: number;
}

function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(getCart);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setCart(getCart());
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    const updated = cart.map((c) =>
      c.product.id === productId ? { ...c, qty } : c
    );
    setCart(updated);
    saveCart(updated);
  };

  const remove = (productId: string) => {
    const updated = cart.filter((c) => c.product.id !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const total = cart.reduce((sum, c) => sum + Number(c.product.price) * c.qty, 0);

  const placeOrder = async () => {
    setPlacing(true);
    setError("");
    try {
      await api.post("/orders", {
        items: cart.map((c) => ({ product_id: c.product.id, qty: c.qty })),
      });
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));
      navigate("/my-orders");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to place order.";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Cart</h1>

      {cart.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}
          <div className="border rounded-lg overflow-x-auto mb-6">
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
                          updateQty(c.product.id, parseInt(e.target.value) || 1)
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
                        onClick={() => remove(c.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <Button className="w-full" onClick={placeOrder} disabled={placing}>
                {placing ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
