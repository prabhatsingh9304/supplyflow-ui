import { useEffect, useState } from "react";
import api from "@/lib/api";
import type {
  ProductListResponse,
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [fullEdit, setFullEdit] = useState(false);

  const fetchProducts = () => {
    api
      .get<ProductListResponse>("/products")
      .then((r) => {
        setProducts(r.data.items);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFullEdit(false);
                  setDialogOpen(true);
                }}
              />
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
                {editing && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-xs text-muted-foreground">Full edit</span>
                    <Switch
                      checked={fullEdit}
                      onCheckedChange={setFullEdit}
                      className="scale-75 origin-right"
                    />
                  </label>
                )}
              </div>
            </DialogHeader>
            <ProductForm
              initial={editing}
              fullEdit={editing ? fullEdit : true}
              onDone={() => {
                setDialogOpen(false);
                fetchProducts();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products yet.</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">GST %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="w-10">
                    {p.pic_url ? (
                      <img
                        src={p.pic_url}
                        alt={p.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.sku || "—"}</TableCell>
                  <TableCell>{p.category || "—"}</TableCell>
                  <TableCell className="text-right">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">{p.stock}</TableCell>
                  <TableCell className="text-right">{Number(p.gst_percent)}%</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(p);
                          setFullEdit(false);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

function ProductForm({
  initial,
  fullEdit,
  onDone,
}: {
  initial: ProductResponse | null;
  fullEdit: boolean;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    sku: initial?.sku ?? "",
    category: initial?.category ?? "",
    pic_url: initial?.pic_url ?? "",
    price: initial?.price?.toString() ?? "",
    gst_percent: initial?.gst_percent?.toString() ?? "0",
    is_active: initial?.is_active ?? true,
  });
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (initial && !fullEdit) {
        const delta = Number(stock) - initial.stock;
        if (delta !== 0) {
          await api.post(`/products/${initial.id}/stock`, { quantity: delta });
        }
      } else if (initial) {
        const body: ProductUpdateRequest = {
          name: form.name || null,
          sku: form.sku || null,
          category: form.category || null,
          pic_url: form.pic_url || null,
          price: form.price ? Number(form.price) : null,
          gst_percent: form.gst_percent ? Number(form.gst_percent) : null,
          is_active: form.is_active,
        };
        await api.patch(`/products/${initial.id}`, body);
      } else {
        const body: ProductCreateRequest = {
          name: form.name,
          sku: form.sku || null,
          category: form.category || null,
          pic_url: form.pic_url || null,
          price: Number(form.price),
          gst_percent: Number(form.gst_percent) || 0,
          is_active: form.is_active,
        };
        await api.post("/products", body);
      }
      onDone();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to save.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {fullEdit ? (
        <>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.pic_url}
              onChange={(e) => update("pic_url", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>GST %</Label>
              <Input
                type="number"
                step="0.01"
                value={form.gst_percent}
                onChange={(e) => update("gst_percent", e.target.value)}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Current: {initial?.stock} &rarr; New: {stock}
          </p>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving..." : fullEdit ? (initial ? "Update" : "Create") : "Update Stock"}
      </Button>
    </form>
  );
}
