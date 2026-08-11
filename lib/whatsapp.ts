import { Order } from "./types";
import { formatPrice, getDeliveryFee, getCodAdvance, isCodOrder } from "./format";
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
    trackingLine: (num: string) => string;
    deliveringTo: (address: string) => string;
    signoff: (brandName: string) => string;
  }
> = {
  en: {
    greeting: (name) => `Hi ${name},`,
    headline: (b, id) =>
      `Good news — your ${b} order #${id} has been handed to the courier and is on its way.`,
    total: (amount) => `Total paid: ${amount}`,
    trackingLine: (num) => `Tracking number: ${num}`,
    deliveringTo: (address) => `Delivering to: ${address}`,
    signoff: (b) => `Reply here if anything looks off. Thanks for shopping with ${b}.`,
  },
  hi: {
    greeting: (name) => `नमस्ते ${name},`,
    headline: (b, id) =>
      `खुशखबरी — आपका ${b} ऑर्डर #${id} कूरियर को सौंप दिया गया है और रास्ते में है।`,
    total: (amount) => `कुल भुगतान: ${amount}`,
    trackingLine: (num) => `ट्रैकिंग नंबर: ${num}`,
    deliveringTo: (address) => `डिलीवरी यहाँ होगी: ${address}`,
    signoff: (b) => `कुछ भी गड़बड़ लगे तो यहीं जवाब दें। ${b} से खरीदारी के लिए धन्यवाद।`,
  },
  gu: {
    greeting: (name) => `નમસ્તે ${name},`,
    headline: (b, id) =>
      `સારા સમાચાર — તમારો ${b} ઓર્ડર #${id} કુરિયરને સોંપી દેવાયો છે અને રસ્તામાં છે.`,
    total: (amount) => `કુલ ચુકવણી: ${amount}`,
    trackingLine: (num) => `ટ્રેકિંગ નંબર: ${num}`,
    deliveringTo: (address) => `ડિલિવરી અહીં થશે: ${address}`,
    signoff: (b) => `કંઈ પણ ખોટું લાગે તો અહીં જ જવાબ આપો. ${b} પરથી ખરીદી બદલ આભાર.`,
  },
};

const LABELS: Record<Language, Record<string, string>> = {
  en: {
    price: "Price",
    courier: "Courier Charge",
    total: "Total",
    advance: "Advance Payment",
    due: "Delivery Time Payment",
    totalPaid: "You have paid total",
  },
  hi: {
    price: "कीमत",
    courier: "कूरियर शुल्क",
    total: "कुल योग",
    advance: "अग्रिम भुगतान",
    due: "डिलीवरी के समय भुगतान",
    totalPaid: "आपने कुल भुगतान किया है",
  },
  gu: {
    price: "કિંમત",
    courier: "કુરિયર ચાર્જ",
    total: "કુલ સરવાળો",
    advance: "એડવાન્સ ચુકવણી",
    due: "ડિલિવરી વખતે ચુકવણી",
    totalPaid: "તમે કુલ ચૂકવેલ છે",
  },
};

// Shared by both message templates below: the itemised price breakdown, with
// the same COD-vs-prepaid branch either message needs (COD has shipped with
// only the advance in, prepaid has the full amount in).
function orderBreakdown(order: Order): string {
  const lang = order.customer.language || "en";
  const lbl = LABELS[lang] ?? LABELS.en;
  const currency = order.currency || siteConfig.currency;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = getDeliveryFee(totalQty);
  const advanceAmount = getCodAdvance(totalQty);

  if (isCodOrder(order)) {
    return [
      `${lbl.price} : ${formatPrice(subtotal, currency)}`,
      `${lbl.courier} : ${formatPrice(deliveryFee, currency)}`,
      `${lbl.total} : ${formatPrice(subtotal + deliveryFee, currency)}`,
      `${lbl.advance}  : ${formatPrice(advanceAmount, currency)}`,
      `${lbl.due} : ${formatPrice(Math.max(0, subtotal + deliveryFee - advanceAmount), currency)}`,
    ].join("\n");
  }

  const courierPaid = Math.max(0, order.amount - subtotal);
  return [
    `${lbl.price} : ${formatPrice(subtotal, currency)}`,
    ...(courierPaid > 0 ? [`${lbl.courier} : ${formatPrice(courierPaid, currency)}`] : []),
    `${lbl.totalPaid} : ${formatPrice(order.amount, currency)}`,
  ].join("\n");
}

// Product names, sizes and colours come straight from the sheet and are
// never translated — they're what's printed on the label.
function orderLines(order: Order): string[] {
  return order.items.map((i) => {
    const variant = [i.size, i.color].filter(Boolean).join(" / ");
    return `- ${i.name} x${i.quantity}${variant ? ` (${variant})` : ""}`;
  });
}

export function shippedMessage(order: Order): string {
  const tpl = TEMPLATES[order.customer.language] ?? TEMPLATES.en;
  const b = brand();

  const address = [order.customer.address, order.customer.city, order.customer.pincode]
    .filter(Boolean)
    .join(", ");

  return [
    tpl.greeting(firstName(order.customer.name)),
    ``,
    tpl.headline(b, order.id.slice(0, 8)),
    ``,
    // Omitted entirely rather than shown blank when no tracking number has
    // been entered yet — a "Tracking number: " line with nothing after it
    // reads as broken, not as "not available yet".
    ...(order.trackingNumber ? [tpl.trackingLine(order.trackingNumber), ``] : []),
    ...orderLines(order),
    ``,
    orderBreakdown(order),
    ``,
    ...(address ? [tpl.deliveringTo(address)] : []),
    ``,
    tpl.signoff(b),
  ].join("\n");
}

// The pre-typed "we've received your payment" message — for a COD order this
// fires once the advance clears, not the full amount, so the wording is
// explicit about that rather than implying the whole order is paid for.
const PAYMENT_TEMPLATES: Record<
  Language,
  {
    greeting: (name: string) => string;
    headlinePrepaid: (brandName: string, id: string) => string;
    headlineCod: (brandName: string, id: string) => string;
    trackingNote: string;
    signoff: (brandName: string) => string;
  }
> = {
  en: {
    greeting: (name) => `Hi ${name},`,
    headlinePrepaid: (b, id) => `Good news — we've received your payment for ${b} order #${id}.`,
    headlineCod: (b, id) =>
      `Good news — we've received your advance payment for ${b} order #${id}. The rest is payable on delivery.`,
    trackingNote: `Your tracking number will be shared here as soon as it ships.`,
    signoff: (b) => `Thanks for shopping with ${b}.`,
  },
  hi: {
    greeting: (name) => `नमस्ते ${name},`,
    headlinePrepaid: (b, id) => `खुशखबरी — आपके ${b} ऑर्डर #${id} का भुगतान मिल गया है।`,
    headlineCod: (b, id) =>
      `खुशखबरी — आपके ${b} ऑर्डर #${id} का अग्रिम भुगतान मिल गया है। बाकी राशि डिलीवरी पर देय होगी।`,
    trackingNote: `शिप होते ही ट्रैकिंग नंबर यहीं भेज दिया जाएगा।`,
    signoff: (b) => `${b} से खरीदारी के लिए धन्यवाद।`,
  },
  gu: {
    greeting: (name) => `નમસ્તે ${name},`,
    headlinePrepaid: (b, id) => `સારા સમાચાર — તમારા ${b} ઓર્ડર #${id} નું ચુકવણું મળી ગયું છે.`,
    headlineCod: (b, id) =>
      `સારા સમાચાર — તમારા ${b} ઓર્ડર #${id} નું એડવાન્સ ચુકવણું મળી ગયું છે. બાકીની રકમ ડિલિવરી વખતે ચૂકવવાની રહેશે.`,
    trackingNote: `શિપ થતાં જ ટ્રેકિંગ નંબર અહીં મોકલી દેવાશે.`,
    signoff: (b) => `${b} પરથી ખરીદી બદલ આભાર.`,
  },
};

export function paymentReceivedMessage(order: Order): string {
  const tpl = PAYMENT_TEMPLATES[order.customer.language] ?? PAYMENT_TEMPLATES.en;
  const b = brand();
  const headline = isCodOrder(order)
    ? tpl.headlineCod(b, order.id.slice(0, 8))
    : tpl.headlinePrepaid(b, order.id.slice(0, 8));

  return [
    tpl.greeting(firstName(order.customer.name)),
    ``,
    headline,
    ``,
    ...orderLines(order),
    ``,
    orderBreakdown(order),
    ``,
    tpl.trackingNote,
    ``,
    tpl.signoff(b),
  ].join("\n");
}
