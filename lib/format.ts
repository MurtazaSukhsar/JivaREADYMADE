export function formatPrice(price: number, currency: string = "AED"): string {
  const displayCurrency = currency === "INR" ? "Rs" : currency;
  return `${displayCurrency} ${price.toLocaleString("en-US")}`;
}
