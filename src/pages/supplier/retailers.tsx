import { useEffect, useState } from "react";
import api from "@/lib/api";
import type {
  RetailerListResponse,
  RetailerResponse,
  RetailerCreateRequest,
  RetailerUpdateRequest,
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
import { Plus, Pencil, Trash2, Power } from "lucide-react";

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<RetailerResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RetailerResponse | null>(null);

  const fetchRetailers = () => {
    api
      .get<RetailerListResponse>("/retailers")
      .then((r) => {
        setRetailers(r.data.items);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this retailer?")) return;
    await api.delete(`/retailers/${id}`);
    fetchRetailers();
  };

  const handleToggleActive = async (r: RetailerResponse) => {
    const action = r.is_active ? "deactivate" : "activate";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${r.user_name}?`)) return;
    await api.patch(`/retailers/${r.id}`, { is_active: !r.is_active } as RetailerUpdateRequest);
    fetchRetailers();
  };

  const openEdit = (r: RetailerResponse) => {
    setEditing(r);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Retailers</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" onClick={openCreate} />
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Retailer
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Retailer" : "Add Retailer"}</DialogTitle>
            </DialogHeader>
            <RetailerForm
              initial={editing}
              onDone={() => {
                setDialogOpen(false);
                fetchRetailers();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : retailers.length === 0 ? (
        <p className="text-muted-foreground">No retailers yet.</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailers.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user_name}</TableCell>
                  <TableCell>{r.shop_name}</TableCell>
                  <TableCell>{r.user_phone}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.address || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? "default" : "secondary"}>
                      {r.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(r)}
                        title={r.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power className={`h-4 w-4 ${r.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(r.id)}
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

function RetailerForm({
  initial,
  onDone,
}: {
  initial: RetailerResponse | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.user_name ?? "",
    phone: initial?.user_phone ?? "",
    pin: "",
    shop_name: initial?.shop_name ?? "",
    address: initial?.address ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (initial) {
        const body: RetailerUpdateRequest = {
          name: form.name || null,
          phone: form.phone || null,
          pin: form.pin || null,
          shop_name: form.shop_name || null,
          address: form.address || null,
        };
        await api.patch(`/retailers/${initial.id}`, body);
      } else {
        const body: RetailerCreateRequest = {
          name: form.name,
          phone: form.phone,
          pin: form.pin,
          shop_name: form.shop_name,
          address: form.address || null,
        };
        await api.post("/retailers", body);
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
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>{initial ? "New 4-digit PIN (leave blank to keep)" : "4-digit PIN"}</Label>
        <Input
          type="password"
          maxLength={4}
          value={form.pin}
          onChange={(e) => update("pin", e.target.value)}
          required={!initial}
          pattern="\d{4}"
          placeholder={initial ? "••••" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Shop Name</Label>
        <Input
          value={form.shop_name}
          onChange={(e) => update("shop_name", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving..." : initial ? "Update" : "Create"}
      </Button>
    </form>
  );
}
