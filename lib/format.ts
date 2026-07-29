export function formatPrice(price: number, currency: string = "AED"): string {
  return `${currency} ${price.toLocaleString("en-US")}`;
}
