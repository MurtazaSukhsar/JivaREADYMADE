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
  email: z.string().trim().email("Enter a valid email").max(200),
  address: z.string().trim().min(5, "Enter your full address").max(400),
  city: z.string().trim().min(2, "Enter your city").max(80),
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

export const verifyPaymentSchema = z.object({
  localOrderId: z.string().trim().min(1),
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});
