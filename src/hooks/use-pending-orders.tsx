import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "@/lib/api";
import { useAuth } from "./use-auth";
import type { DashboardResponse } from "@/types";

interface PendingOrdersContextType {
  pendingCount: number;
}

const PendingOrdersContext = createContext<PendingOrdersContextType>({ pendingCount: 0 });

export function PendingOrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "supplier") return;
    const fetch = () => {
      api
        .get<DashboardResponse>("/analytics/dashboard")
        .then((r) => setPendingCount(r.data.pending_orders))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <PendingOrdersContext.Provider value={{ pendingCount }}>
      {children}
    </PendingOrdersContext.Provider>
  );
}

export function usePendingOrders() {
  return useContext(PendingOrdersContext);
}
