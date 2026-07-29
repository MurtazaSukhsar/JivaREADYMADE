import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local — see .env.example. ` +
        `Get your keys from the Razorpay dashboard under Settings → API Keys.`
    );
  }
  return value;
}

export function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: requireEnv("RAZORPAY_KEY_ID"),
    key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
  });
}

// Amount in the smallest currency unit (paise for INR, fils for AED, cents
// for USD — all 2-decimal currencies use x100). Razorpay requires this.
export function toSubunits(amount: number): number {
  return Math.round(amount * 100);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Verifies the signature Razorpay Checkout returns to the browser after
// payment. This is the check that stops someone from calling
// /api/checkout/verify directly and claiming they paid when they didn't —
// never mark an order paid without this passing.
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = requireEnv("RAZORPAY_KEY_SECRET");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return timingSafeEqualStr(expected, signature);
}

// Verifies the X-Razorpay-Signature header on incoming webhook calls.
// `rawBody` must be the exact, unparsed request body text — the signature
// is computed over the raw bytes, so parsing and re-stringifying first will
// break verification.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = requireEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualStr(expected, signature);
}
