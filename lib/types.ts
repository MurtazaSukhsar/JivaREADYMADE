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
  // "upi_pending" — the customer scanned the UPI QR and told us they paid,
  // but nobody has checked the bank yet. UPI QR payments have no callback,
  // so this is the one status that only a human can clear (admin → Mark
  // paid). Treat it as "money probably arrived", never as "money arrived".
  status: "created" | "paid" | "failed" | "cod_pending" | "upi_pending";
  customer: Customer;
  // For UPI orders this holds the `tr` reference we generated and sent in
  // the payment link, not a Razorpay order — same column, same purpose.
  razorpayOrderId: string;
  // For UPI orders this is the reference number the customer typed in after
  // paying (their app calls it "UPI transaction ID" / "UTR").
  razorpayPaymentId?: string;
  shipped: boolean;
  shippedAt?: string;
  // Courier's tracking/AWB number, entered by hand once the parcel is
  // handed over. Included in the "shipped" WhatsApp message when present.
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  // Which row of the Orders sheet this came from. Internal bookkeeping so an
  // update can target the exact row instead of appending a duplicate.
  rowNumber?: number;
};
