import { Order } from "./types";

export function formatPrice(price: number, currency: string = "AED"): string {
  if (currency === "INR") {
    // Indian Rupee — prefix with ₹ symbol, no trailing text.
    return `₹${price.toLocaleString("en-IN")}`;
  }
  return `${price.toLocaleString("en-US")} ${currency}`;
}

export function getDeliveryFee(totalQuantity: number): number {
  if (totalQuantity <= 0) return 0;
  return 50 + 30 * (totalQuantity - 1);
}

export function getCodAdvance(totalQuantity: number): number {
  if (totalQuantity <= 0) return 0;
  return 100 + 50 * (totalQuantity - 1);
}

export function isCodOrder(order: Order): boolean {
  if (order.status === "cod_pending") return true;
  if (order.status === "created") {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return order.amount === subtotal;
  }
  return false;
}
