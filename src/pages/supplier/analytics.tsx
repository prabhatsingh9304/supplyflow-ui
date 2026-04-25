import { useEffect, useState } from "react";
import api from "@/lib/api";
import type {
  RevenueResponse,
  TopProductsResponse,
  TopRetailersResponse,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsResponse | null>(null);
  const [topRetailers, setTopRetailers] = useState<TopRetailersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<RevenueResponse>("/analytics/revenue"),
      api.get<TopProductsResponse>("/analytics/top-products"),
      api.get<TopRetailersResponse>("/analytics/top-retailers"),
    ])
      .then(([rev, prod, ret]) => {
        setRevenue(rev.data);
        setTopProducts(prod.data);
        setTopRetailers(ret.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>

      {revenue && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₹{Number(revenue.total_revenue).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₹{Number(revenue.total_tax).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{revenue.total_orders}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topProducts && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.items.map((p) => (
                    <TableRow key={p.product_id}>
                      <TableCell className="font-medium">{p.product_name}</TableCell>
                      <TableCell className="text-right">{p.total_qty}</TableCell>
                      <TableCell className="text-right">
                        ₹{Number(p.total_revenue).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {topProducts.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {topRetailers && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Retailers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topRetailers.items.map((r) => (
                    <TableRow key={r.retailer_id}>
                      <TableCell className="font-medium">{r.shop_name}</TableCell>
                      <TableCell className="text-right">{r.total_orders}</TableCell>
                      <TableCell className="text-right">
                        ₹{Number(r.total_spent).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {topRetailers.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
