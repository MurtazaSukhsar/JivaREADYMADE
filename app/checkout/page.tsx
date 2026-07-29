"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
};

const EMPTY_CUSTOMER: Customer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  pincode: "",
};

// Mirrors lib/validation.ts so the customer sees the problem before a
// round-trip. The server still re-validates — this is convenience, not
// security.
function validate(c: Customer): Partial<Record<keyof Customer, string>> {
  const errors: Partial<Record<keyof Customer, string>> = {};
  if (c.name.trim().length < 2) errors.name = "Enter your full name";
  if (!/^\+?[0-9\s-]{6,20}$/.test(c.phone.trim()))
    errors.phone = "Enter a valid phone number";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email.trim()))
    errors.email = "Enter a valid email";
  if (c.address.trim().length < 5) errors.address = "Enter your full address";
  if (c.city.trim().length < 2) errors.city = "Enter your city";
  if (!/^[A-Za-z0-9\s-]{4,12}$/.test(c.pincode.trim()))
    errors.pincode = "Enter a valid pincode";
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "verifying" | "creating_cod">("idle");
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Customer, string>>>({});

  const set = (key: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer((c) => ({ ...c, [key]: e.target.value }));
    setFieldErrors((f) => ({ ...f, [key]: undefined }));
  };

  const handlePay = async () => {
    setError(null);

    const errors = validate(customer);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Check the highlighted fields before paying.");
      return;
    }

    setStatus("creating");

    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          customer: {
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim(),
            address: customer.address.trim(),
            city: customer.city.trim(),
            pincode: customer.pincode.trim(),
          },
        }),
      });
      const created = await createRes.json();

      if (!createRes.ok) {
        setError(created.error ?? "Could not start checkout.");
        setStatus("idle");
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        setError("Payment script hasn't loaded yet — try again in a moment.");
        setStatus("idle");
        return;
      }

      setStatus("paying");

      const rzp = new window.Razorpay({
        key: created.keyId,
        amount: created.amountInSubunits,
        currency: created.currency,
        order_id: created.razorpayOrderId,
        name: siteConfig.name,
        description: `Order · ${items.length} item${items.length === 1 ? "" : "s"}`,
        prefill: created.prefill,
        theme: { color: "#D97B5D", backdrop_color: "#181B21" },
        modal: {
          ondismiss: () => {
            setStatus("idle");
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("verifying");
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                localOrderId: created.localOrderId,
                ...response,
              }),
            });
            const verified = await verifyRes.json();

            if (!verifyRes.ok) {
              setError(verified.error ?? "Payment could not be verified.");
              setStatus("idle");
              return;
            }

            clear();
            router.push(`/order/${verified.orderId}/confirmation`);
          } catch {
            setError("Payment went through, but we couldn't confirm it. Contact support with your payment ID.");
            setStatus("idle");
          }
        },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed or was cancelled. No charge was made.");
        setStatus("idle");
      });

      rzp.open();
    } catch {
      setError("Could not reach the server. Try again.");
      setStatus("idle");
    }
  };

  const handleCOD = async () => {
    setError(null);
    const errors = validate(customer);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Check the highlighted fields before ordering.");
      return;
    }

    setStatus("creating_cod");
    try {
      const createRes = await fetch("/api/checkout/create-cod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            slug: i.slug,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          customer: {
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim(),
            address: customer.address.trim(),
            city: customer.city.trim(),
            pincode: customer.pincode.trim(),
          },
        }),
      });
      const created = await createRes.json();

      if (!createRes.ok) {
        setError(created.error ?? "Could not start checkout.");
        setStatus("idle");
        return;
      }

      clear();
      router.push(`/order/${created.localOrderId}/confirmation`);
    } catch {
      setError("Could not reach the server. Try again.");
      setStatus("idle");
    }
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-lg px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl text-cream">Your bag is empty</h1>
        <p className="mt-3 font-body text-sm text-ash">
          Add something to your bag before checking out.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      <h1 className="font-display text-3xl text-cream">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* --- delivery details --- */}
        <div className="rounded-sm border border-line/60 bg-slate/40 p-6 sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
            Delivery details
          </p>
          <p className="mt-2 font-body text-xs text-ash/70">
            We use your phone number to send a WhatsApp update when the parcel
            ships.
          </p>

          <div className="mt-6 space-y-5">
            <Field label="Full name" error={fieldErrors.name}>
              <input
                value={customer.name}
                onChange={set("name")}
                placeholder="Aman Verma"
                autoComplete="name"
                className="input"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp number" error={fieldErrors.phone}>
                <input
                  value={customer.phone}
                  onChange={set("phone")}
                  placeholder={`+${siteConfig.defaultCountryCode} 98765 43210`}
                  inputMode="tel"
                  autoComplete="tel"
                  className="input"
                />
              </Field>

              <Field label="Email" error={fieldErrors.email}>
                <input
                  value={customer.email}
                  onChange={set("email")}
                  placeholder="you@email.com"
                  inputMode="email"
                  autoComplete="email"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Address" error={fieldErrors.address}>
              <textarea
                value={customer.address}
                onChange={set("address")}
                rows={3}
                placeholder="Flat / house no., building, street, area"
                autoComplete="street-address"
                className="input resize-none"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" error={fieldErrors.city}>
                <input
                  value={customer.city}
                  onChange={set("city")}
                  placeholder="Mumbai"
                  autoComplete="address-level2"
                  className="input"
                />
              </Field>

              <Field label="Pincode" error={fieldErrors.pincode}>
                <input
                  value={customer.pincode}
                  onChange={set("pincode")}
                  placeholder="400001"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  className="input"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* --- summary + pay --- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80">
            Order summary
          </p>

          <div className="mt-3 divide-y divide-line/50 rounded-sm border border-line/50 bg-slate/40 px-4">
            {items.map((item) => (
              <div key={`${item.slug}-${item.size}-${item.color}`} className="flex justify-between py-3">
                <div>
                  <p className="font-body text-sm text-cream">{item.name}</p>
                  <p className="font-mono text-xs text-ash/70">
                    Qty {item.quantity} {item.size ? `· ${item.size}` : ""} {item.color ? `· ${item.color}` : ""}
                  </p>
                </div>
                <p className="font-mono text-sm text-cream">
                  {formatPrice(item.price * item.quantity, siteConfig.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-sm uppercase tracking-widest2 text-ash">Total</p>
            <p className="font-display text-2xl text-cream">{formatPrice(subtotal, siteConfig.currency)}</p>
          </div>
          <p className="mt-1 font-body text-xs text-ash/60">
            This total is an estimate — Razorpay charges the amount our server confirms
            against the current catalog, not this number.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handlePay}
              disabled={status !== "idle"}
              className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
            >
              {status === "idle" && "Pay with Razorpay"}
              {status === "creating" && "Preparing order…"}
              {status === "paying" && "Waiting for payment…"}
              {status === "verifying" && "Confirming payment…"}
            </button>
            <button
              type="button"
              onClick={handleCOD}
              disabled={status !== "idle"}
              className="w-full rounded-sm border border-ember text-ember py-3.5 font-mono text-xs uppercase tracking-widest2 transition-all duration-200 hover:bg-ember/10 disabled:opacity-50"
            >
              {status === "idle" && "Cash on Delivery"}
              {status === "creating_cod" && "Placing order…"}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block font-body text-xs text-ember">{error}</span>}
    </label>
  );
}
