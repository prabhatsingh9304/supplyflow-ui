import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  LogOut,
  Store,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { usePendingOrders } from "@/hooks/use-pending-orders";
import { useState } from "react";

const supplierLinks = [
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/retailers", label: "Retailers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const retailerLinks = [
  { to: "/catalog", label: "Catalog", icon: Package },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/my-orders", label: "My Orders", icon: FileText },
  { to: "/my-invoices", label: "My Invoices", icon: FileText },
];

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { pendingCount } = usePendingOrders();
  const [open, setOpen] = useState(false);
  const links = user?.role === "supplier" ? supplierLinks : retailerLinks;

  return (
    <header className="md:hidden flex items-center justify-between border-b border-border px-4 py-3 sticky top-0 bg-background z-50">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5" />
        <span className="font-semibold">SupplyFlow</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" />}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="px-5 py-4 text-lg font-semibold">Menu</SheetTitle>
          <Separator />
          <nav className="flex-1 px-3 py-4 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {link.to === "/orders" && pendingCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <Separator />
          <div className="p-3">
            <div className="px-3 py-2 text-xs text-muted-foreground truncate">
              {user?.name} &middot; {user?.role}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm"
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
