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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePendingOrders } from "@/hooks/use-pending-orders";

const supplierLinks = [
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/invoices", label: "Manual Invoices", icon: FileText },
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

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pendingCount } = usePendingOrders();
  const links = user?.role === "supplier" ? supplierLinks : retailerLinks;

  return (
    <aside className="hidden md:flex md:w-60 flex-col border-r border-border bg-background h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-4">
        <Store className="h-6 w-6" />
        <span className="text-lg font-semibold tracking-tight">SupplyFlow</span>
      </div>
      <Separator />
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
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
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
