export type UserRole = "supplier" | "retailer" | "staff";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled";

// Auth
export interface SupplierRegisterRequest {
  name: string;
  phone: string;
  password: string;
  organization_name: string;
  gst_number?: string | null;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface UserResponse {
  id: string;
  organization_id: string;
  role: UserRole;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

// Retailers
export interface RetailerCreateRequest {
  name: string;
  phone: string;
  pin: string;
  shop_name: string;
  address?: string | null;
  credit_limit?: number;
}

export interface RetailerUpdateRequest {
  name?: string | null;
  phone?: string | null;
  pin?: string | null;
  shop_name?: string | null;
  address?: string | null;
  credit_limit?: number | null;
  is_active?: boolean | null;
}

export interface RetailerResponse {
  id: string;
  organization_id: string;
  user_id: string;
  shop_name: string;
  address: string | null;
  credit_limit: number;
  outstanding: number;
  created_at: string;
  user_name: string;
  user_phone: string;
  is_active: boolean;
}

export interface RetailerListResponse {
  items: RetailerResponse[];
  total: number;
}

// Products
export interface ProductCreateRequest {
  name: string;
  sku?: string | null;
  category?: string | null;
  pic_url?: string | null;
  price: number;
  stock?: number;
  gst_percent?: number;
  is_active?: boolean;
}

export interface ProductUpdateRequest {
  name?: string | null;
  sku?: string | null;
  category?: string | null;
  pic_url?: string | null;
  price?: number | null;
  gst_percent?: number | null;
  is_active?: boolean | null;
}

export interface StockUpdateRequest {
  quantity: number;
}

export interface ProductResponse {
  id: string;
  organization_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  pic_url: string | null;
  price: number;
  stock: number;
  gst_percent: number;
  is_active: boolean;
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
}

// Orders
export interface OrderItemRequest {
  product_id: string;
  qty: number;
}

export interface OrderCreateRequest {
  items: OrderItemRequest[];
}

export interface SupplierOrderCreateRequest {
  retailer_id: string;
  items: OrderItemRequest[];
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

export interface OrderItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: number;
}

export interface OrderResponse {
  id: string;
  organization_id: string;
  retailer_id: string;
  retailer_name: string;
  retailer_phone: string;
  retailer_address: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  items: OrderItemResponse[];
}

export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
}

// Invoices
export interface InvoiceResponse {
  id: string;
  organization_id: string;
  order_id: string;
  invoice_no: string;
  total: number;
  pdf_path: string | null;
  created_at: string;
}

// Analytics
export interface DashboardResponse {
  total_retailers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  delivered_orders: number;
}

export interface RevenueResponse {
  total_revenue: number;
  total_tax: number;
  total_orders: number;
}

export interface TopProductItem {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

export interface TopProductsResponse {
  items: TopProductItem[];
}

export interface TopRetailerItem {
  retailer_id: string;
  shop_name: string;
  total_orders: number;
  total_spent: number;
}

export interface TopRetailersResponse {
  items: TopRetailerItem[];
}
