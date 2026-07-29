import { Order } from "./types";
import { formatPrice } from "./format";
import { siteConfig } from "./config";
import type { Language } from "./i18n";

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

// The pre-typed "your order has shipped" message, in each of the three
// languages the popup offers. The customer gets it in whichever one they
// picked at checkout. Edit the wording here and every order picks it up;
// the admin panel also lets you tweak any single message before sending.
//
// Note the fallback names ("there") stay English — they only appear when a
// customer somehow checked out without a name.
const TEMPLATES: Record<
  Language,
  {
    greeting: (name: string) => string;
    headline: (brandName: string, id: string) => string;
    total: (amount: string) => string;
    deliveringTo: (address: string) => string;
    signoff: (brandName: string) => string;
  }
> = {
  en: {
    greeting: (name) => `Hi ${name},`,
    headline: (b, id) =>
      `Good news — your ${b} order #${id} has been handed to the courier and is on its way.`,
    total: (amount) => `Total paid: ${amount}`,
    deliveringTo: (address) => `Delivering to: ${address}`,
    signoff: (b) => `Reply here if anything looks off. Thanks for shopping with ${b}.`,
  },
  hi: {
    greeting: (name) => `नमस्ते ${name},`,
    headline: (b, id) =>
      `खुशखबरी — आपका ${b} ऑर्डर #${id} कूरियर को सौंप दिया गया है और रास्ते में है।`,
    total: (amount) => `कुल भुगतान: ${amount}`,
    deliveringTo: (address) => `डिलीवरी यहाँ होगी: ${address}`,
    signoff: (b) => `कुछ भी गड़बड़ लगे तो यहीं जवाब दें। ${b} से खरीदारी के लिए धन्यवाद।`,
  },
  gu: {
    greeting: (name) => `નમસ્તે ${name},`,
    headline: (b, id) =>
      `સારા સમાચાર — તમારો ${b} ઓર્ડર #${id} કુરિયરને સોંપી દેવાયો છે અને રસ્તામાં છે.`,
    total: (amount) => `કુલ ચુકવણી: ${amount}`,
    deliveringTo: (address) => `ડિલિવરી અહીં થશે: ${address}`,
    signoff: (b) => `કંઈ પણ ખોટું લાગે તો અહીં જ જવાબ આપો. ${b} પરથી ખરીદી બદલ આભાર.`,
  },
};

export function shippedMessage(order: Order): string {
  const tpl = TEMPLATES[order.customer.language] ?? TEMPLATES.en;
  const b = brand();

  // Product names, sizes and colours come straight from the sheet and are
  // never translated — they're what's printed on the label.
  const lines = order.items.map((i) => {
    const variant = [i.size, i.color].filter(Boolean).join(" / ");
    return `- ${i.name} x${i.quantity}${variant ? ` (${variant})` : ""}`;
  });

  const address = [order.customer.address, order.customer.city, order.customer.pincode]
    .filter(Boolean)
    .join(", ");

  return [
    tpl.greeting(firstName(order.customer.name)),
    ``,
    tpl.headline(b, order.id.slice(0, 8)),
    ``,
    ...lines,
    ``,
    tpl.total(formatPrice(order.amount, order.currency || siteConfig.currency)),
    ...(address ? [tpl.deliveringTo(address)] : []),
    ``,
    tpl.signoff(b),
  ].join("\n");
}
