import type { Language } from "./i18n";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  styleCode: string;
  sizes: string[];
  colors: string[];
  description: string;
  images: string[];
  createdAt: string;
  hidden?: boolean;     // true = not shown on storefront
  rowNumber?: number;   // Google Sheets row index (for edit/delete)
};

export type NewProductInput = {
  name: string;
  price: number;
  sizes: string[];
  colors: string[];
  description: string;
  images: string[];
};

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

// Everything the shop needs to actually ship the parcel and message the
// customer. Phone is stored in full international form (e.g. "+919876543210")
// because that's what a wa.me link needs.
export type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Which language they picked in the popup. Stored so the "your order has
  // shipped" WhatsApp message goes out in the language they actually read.
  language: Language;
};

export type Order = {
  id: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "cod_pending";
  customer: Customer;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  shipped: boolean;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Which row of the Orders sheet this came from. Internal bookkeeping so an
  // update can target the exact row instead of appending a duplicate.
  rowNumber?: number;
};
