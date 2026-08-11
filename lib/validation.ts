import { z } from "zod";

export const newProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().finite().positive().max(1_000_000),
  sizes: z.array(z.string().trim().min(1).max(20)).max(15).default([]),
  colors: z.array(z.string().trim().min(1).max(30)).max(15).default([]),
  description: z.string().trim().max(2000).default(""),
  images: z
    .array(
      z
        .string()
        .refine((url) => url.startsWith("https://") || url.startsWith("/uploads/"), "Image URLs must use https or start with /uploads/")
    )
    .max(8)
    .default([]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1).max(200),
});

export const cartItemSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  quantity: z.number().int().positive().max(20),
  size: z.string().trim().max(20).optional(),
  color: z.string().trim().max(30).optional(),
});

// Collected at checkout so the parcel can actually be shipped and the
// customer can be messaged on WhatsApp afterwards.
export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, "Phone can only contain digits, spaces, - and +"),
  email: z.string().trim().max(200).optional().default(""),
  address: z.string().trim().min(5, "Enter your full address").max(400),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your town, city, district, or state").max(120),
  pincode: z
    .string()
    .trim()
    .min(4, "Enter a valid pincode")
    .max(12)
    .regex(/^[A-Za-z0-9\s-]+$/, "Pincode can only contain letters, digits and -"),
  // Sent by the checkout form from the language popup. Defaults to English
  // so an older cached page that doesn't send it still validates.
  language: z.enum(["en", "hi", "gu"]).default("en"),
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  customer: customerSchema,
});

export const shipOrderSchema = z.object({
  shipped: z.boolean(),
});

// Courier AWB/tracking numbers vary a lot by carrier — some are pure digits,
// some mix letters in. Kept permissive; empty string is allowed on purpose
// so admin can clear a wrongly-entered number.
export const trackingNumberSchema = z.object({
  trackingNumber: z.string().trim().max(60),
});

// What the customer types in after paying by UPI QR. Their app labels it
// "UPI transaction ID", "UTR" or "Reference no." — usually 12 digits, but
// PhonePe and a few banks issue longer alphanumeric ones, so this stays
// permissive.
//
// DELIBERATELY OPTIONAL. It is a bookkeeping handle to search the bank
// statement with, not proof of payment — the shop owner verifies against the
// account either way. Making it mandatory doesn't stop a liar (who can type
// twelve random digits) but does block an honest customer who can't find the
// number, and a blocked customer is a lost sale. Orders without a reference
// are still findable by amount, time and the `tr` on the statement.
export const confirmUpiSchema = z.object({
  localOrderId: z.string().trim().min(1).max(64),
  upiRef: z
    .string()
    .trim()
    .max(35)
    .regex(/^[A-Za-z0-9]*$/, "Reference number can only contain letters and digits")
    .optional()
    .default(""),
});

// Admin-only: confirm by eye that a UPI payment landed in the bank.
export const markPaidSchema = z.object({
  paid: z.boolean(),
});

// Everything the browser sends after the Cashfree modal closes.
//
// Deliberately just the order id: no payment id, no signature, no amount, not
// even whether it was a full payment or a COD advance. All of that is read
// back from Cashfree server-to-server, so there is nothing here worth
// forging — the worst a tampered request can do is ask about someone else's
// order id, which returns only ok/not-ok.
export const verifyCashfreeSchema = z.object({
  localOrderId: z.string().trim().min(1).max(64),
});

export const verifyPaymentSchema = z.object({
  localOrderId: z.string().trim().min(1),
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});
