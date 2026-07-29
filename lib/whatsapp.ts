import { Order } from "./types";
import { formatPrice } from "./format";
import { siteConfig } from "./config";

// Click-to-chat, not the WhatsApp Business API: we build a wa.me link with
// the message pre-typed, the shop owner reviews it and presses send in their
// own WhatsApp. No Meta template approval, no 24-hour messaging window, and
// it works from a plain phone number.

// wa.me wants digits only — no "+", spaces, dashes or brackets. A number
// typed without a country code gets the site's default one prepended, since
// wa.me silently fails on local-format numbers.
export function toWhatsAppNumber(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  const hasCountryCode =
    trimmed.startsWith("+") || trimmed.startsWith("00") || digits.length > 10;
  if (hasCountryCode) return digits.replace(/^00/, "");

  return `${siteConfig.defaultCountryCode}${digits}`;
}

export function whatsAppLink(phone: string, message: string): string {
  const number = toWhatsAppNumber(phone);
  const text = encodeURIComponent(message);
  // Without a number wa.me opens the contact picker, which still beats a
  // dead link when a phone number was mistyped.
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

// siteConfig.name is "FIELD." — brand names that already end in punctuation
// would otherwise produce "shopping with FIELD..".
function brand(): string {
  return siteConfig.name.replace(/[.!?]+$/, "");
}

// The pre-typed "your order has shipped" message. Edit the wording here and
// every order picks it up — the admin panel also lets you tweak any single
// message before sending.
export function shippedMessage(order: Order): string {
  const lines = order.items.map((i) => {
    const variant = [i.size, i.color].filter(Boolean).join(" / ");
    return `- ${i.name} x${i.quantity}${variant ? ` (${variant})` : ""}`;
  });

  const address = [order.customer.address, order.customer.city, order.customer.pincode]
    .filter(Boolean)
    .join(", ");

  return [
    `Hi ${firstName(order.customer.name)},`,
    ``,
    `Good news — your ${siteConfig.name} order #${order.id.slice(0, 8)} has been handed to the courier and is on its way.`,
    ``,
    ...lines,
    ``,
    `Total paid: ${formatPrice(order.amount, order.currency || siteConfig.currency)}`,
    ...(address ? [`Delivering to: ${address}`] : []),
    ``,
    `Reply here if anything looks off. Thanks for shopping with ${brand()}.`,
  ].join("\n");
}
