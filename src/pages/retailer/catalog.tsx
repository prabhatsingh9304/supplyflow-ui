import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { ProductListResponse, ProductResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight, Plus, Minus } from "lucide-react";

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

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(getCart);
  const navigate = useNavigate();

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + Number(c.product.price) * c.qty, 0);

  useEffect(() => {
    api
      .get<ProductListResponse>("/products")
      .then((r) => setProducts(r.data.items.filter((p) => p.is_active)))
      .finally(() => setLoading(false));
  }, []);

  const setQty = (product: ProductResponse, qty: number) => {
    if (qty <= 0) {
      const updated = cart.filter((c) => c.product.id !== product.id);
      setCart(updated);
      saveCart(updated);
      return;
    }
    const existing = cart.find((c) => c.product.id === product.id);
    const updated = existing
      ? cart.map((c) => (c.product.id === product.id ? { ...c, qty } : c))
      : [...cart, { product, qty }];
    setCart(updated);
    saveCart(updated);
  };

  const getQty = (id: string) => cart.find((c) => c.product.id === id)?.qty || 0;

  if (loading) return <p className="text-muted-foreground">Loading products...</p>;

  return (
    <div className={cart.length > 0 ? "pb-24" : ""}>
      <h1 className="text-2xl font-semibold mb-6">Product Catalog</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.pic_url && (
                <img
                  src={p.pic_url}
                  alt={p.name}
                  className="h-36 w-full object-cover"
                />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.stock <= 0 && <Badge variant="secondary">Out of stock</Badge>}
                </div>
                {p.category && (
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      GST {Number(p.gst_percent)}% · Stock: {p.stock}
                    </p>
                  </div>
                  {getQty(p.id) === 0 ? (
                    <Button
                      size="sm"
                      disabled={p.stock <= 0}
                      onClick={() => setQty(p, 1)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => setQty(p, getQty(p.id) - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {getQty(p.id)}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        disabled={getQty(p.id) >= p.stock}
                        onClick={() => setQty(p, getQty(p.id) + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {totalItems} {totalItems === 1 ? "item" : "items"} in cart
                </p>
                <p className="text-lg font-bold">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/cart")}>
              View Cart
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
