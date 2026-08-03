"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { plural, type TranslationKey } from "@/lib/i18n";

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
  state: string;
  pincode: string;
};

const EMPTY_CUSTOMER: Customer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

// Mirrors lib/validation.ts so the customer sees the problem before a
// round-trip. The server still re-validates — this is convenience, not
// security.
function validate(c: Customer): Partial<Record<keyof Customer, TranslationKey>> {
  const errors: Partial<Record<keyof Customer, TranslationKey>> = {};
  if (c.name.trim().length < 2) errors.name = "err.name";
  if (!/^\+?[0-9\s-]{6,20}$/.test(c.phone.trim())) errors.phone = "err.phone";
  if (c.address.trim().length < 5) errors.address = "err.address";
  if (c.city.trim().length < 2) errors.city = "err.city";
  if (c.state.trim().length < 2) errors.state = "err.state";
  if (!/^[A-Za-z0-9\s-]{4,12}$/.test(c.pincode.trim())) errors.pincode = "err.pincode";
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { t, language } = useLanguage();
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "verifying" | "creating_cod">("idle");
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Customer, TranslationKey>>>({});
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const set = (key: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer((c) => ({ ...c, [key]: e.target.value }));
    setFieldErrors((f) => ({ ...f, [key]: undefined }));
  };

  const handlePay = async () => {
    setError(null);

    const errors = validate(customer);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(t("err.checkFields"));
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
            state: customer.state.trim(),
            pincode: customer.pincode.trim(),
            language,
          },
        }),
      });
      const created = await createRes.json();

      if (!createRes.ok) {
        setError(created.error ?? t("err.couldNotStart"));
        setStatus("idle");
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        setError(t("err.scriptNotReady"));
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
        description: plural(t, "checkout.orderDescription", items.length),
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
              setError(verified.error ?? t("err.notVerified"));
              setStatus("idle");
              return;
            }

            clear();
            router.push(`/order/${verified.orderId}/confirmation`);
          } catch {
            setError(t("err.unconfirmed"));
            setStatus("idle");
          }
        },
      });

      rzp.on("payment.failed", () => {
        setError(t("err.paymentFailed"));
        setStatus("idle");
      });

      rzp.open();
    } catch {
      setError(t("err.server"));
      setStatus("idle");
    }
  };

  const handleCOD = async () => {
    setError(null);
    const errors = validate(customer);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(t("err.checkFieldsOrder"));
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
            state: customer.state.trim(),
            pincode: customer.pincode.trim(),
            language,
          },
        }),
      });
      const created = await createRes.json();

      if (!createRes.ok) {
        setError(created.error ?? t("err.couldNotStart"));
        setStatus("idle");
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        setError(t("err.scriptNotReady"));
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
        description: `COD Advance - ${siteConfig.name}`,
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
            const verifyRes = await fetch("/api/checkout/verify-cod", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                localOrderId: created.localOrderId,
                ...response,
              }),
            });
            const verified = await verifyRes.json();

            if (!verifyRes.ok) {
              setError(verified.error ?? t("err.notVerified"));
              setStatus("idle");
              return;
            }

            clear();
            router.push(`/order/${verified.orderId}/confirmation`);
          } catch {
            setError(t("err.unconfirmed"));
            setStatus("idle");
          }
        },
      });

      rzp.on("payment.failed", () => {
        setError(t("err.paymentFailed"));
        setStatus("idle");
      });

      rzp.open();
    } catch {
      setError(t("err.server"));
      setStatus("idle");
    }
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-lg px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl text-cream">{t("cart.emptyTitle")}</h1>
        <p className="mt-3 font-body text-sm text-ash">{t("checkout.emptyBody")}</p>
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

      <h1 className="font-display text-3xl text-cream">{t("checkout.title")}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* --- delivery details --- */}
        <div className="rounded-sm border border-line/60 bg-slate/40 p-6 sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
            {t("checkout.deliveryDetails")}
          </p>
          <p className="mt-2 font-body text-xs text-ash/70">{t("checkout.whatsappNote")}</p>

          <div className="mt-6 space-y-5">
            <Field label={t("checkout.name")} error={fieldErrors.name && t(fieldErrors.name)}>
              <input
                value={customer.name}
                onChange={set("name")}
                placeholder="Aman Verma"
                autoComplete="name"
                className="input"
              />
            </Field>

            <Field label={t("checkout.phone")} error={fieldErrors.phone && t(fieldErrors.phone)}>
              <input
                value={customer.phone}
                onChange={set("phone")}
                placeholder={`+${siteConfig.defaultCountryCode} 98765 43210`}
                inputMode="tel"
                autoComplete="tel"
                className="input"
              />
            </Field>

            <Field label={t("checkout.address")} error={fieldErrors.address && t(fieldErrors.address)}>
              <textarea
                value={customer.address}
                onChange={set("address")}
                rows={3}
                placeholder={t("checkout.addressPlaceholder")}
                autoComplete="street-address"
                className="input resize-none"
              />
            </Field>

            <Field label={t("checkout.state")} error={fieldErrors.state && t(fieldErrors.state)}>
              <input
                value={customer.state}
                onChange={set("state")}
                placeholder="Maharashtra"
                className="input"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("checkout.city")} error={fieldErrors.city && t(fieldErrors.city)}>
                <input
                  value={customer.city}
                  onChange={set("city")}
                  placeholder="Mumbai"
                  autoComplete="address-level2"
                  className="input"
                />
              </Field>

              <Field label={t("checkout.pincode")} error={fieldErrors.pincode && t(fieldErrors.pincode)}>
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
            {t("checkout.orderSummary")}
          </p>

          <div className="mt-3 divide-y divide-line/50 rounded-sm border border-line/50 bg-slate/40 px-4">
            {items.map((item) => (
              <div key={`${item.slug}-${item.size}-${item.color}`} className="flex justify-between py-3">
                <div>
                  <p className="font-body text-sm text-cream">{item.name}</p>
                  <p className="font-mono text-xs text-ash/70">
                    {t("common.qty", { n: item.quantity })} {item.size ? `· ${item.size}` : ""} {item.color ? `· ${item.color}` : ""}
                  </p>
                </div>
                <p className="font-body text-sm text-cream">
                  {formatPrice(item.price * item.quantity, siteConfig.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-sm uppercase tracking-widest2 text-ash">{t("common.total")}</p>
            <p className="font-display text-2xl text-cream">{formatPrice(subtotal, siteConfig.currency)}</p>
          </div>
          <p className="mt-1 font-body text-xs text-ash/60">{t("checkout.estimateNote")}</p>

          <div className="mt-6 border-t border-line/60 pt-5">
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80 mb-3">
              {t("checkout.paymentMethod")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Online payment option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`rounded-sm border p-4 text-left transition-all duration-200 ${
                  paymentMethod === "online"
                    ? "border-ember bg-ember/10"
                    : "border-line/60 bg-slate/20 hover:border-ash/50"
                }`}
              >
                <span className="block font-display text-sm font-semibold text-cream">
                  {t("checkout.method.online")}
                </span>
                <span className="mt-1.5 block font-body text-[10px] text-ash/60 leading-normal">
                  {t("checkout.method.onlineSub")}
                </span>
              </button>

              {/* COD option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`rounded-sm border p-4 text-left transition-all duration-200 ${
                  paymentMethod === "cod"
                    ? "border-ember bg-ember/10"
                    : "border-line/60 bg-slate/20 hover:border-ash/50"
                }`}
              >
                <span className="block font-display text-sm font-semibold text-cream">
                  {t("checkout.method.cod")}
                </span>
                <span className="mt-1.5 block font-body text-[10px] text-ash/60 leading-normal">
                  {t("checkout.method.codSub")}
                </span>
              </button>
            </div>
          </div>

          {paymentMethod === "cod" && (
            <div className="mt-5 rounded-sm border border-line/50 bg-slate/20 px-3.5 py-3 font-body text-xs text-ash/80 space-y-1.5 transition-all duration-200">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
                {t("checkout.cod.terms")}
              </p>
              <div className="flex justify-between">
                <span>{t("confirm.cod.price")}</span>
                <span className="text-cream">{formatPrice(subtotal, siteConfig.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("confirm.cod.courier")}</span>
                <span className="text-cream">{formatPrice(50, siteConfig.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-cream">
                <span>{t("confirm.cod.total")}</span>
                <span>{formatPrice(subtotal + 50, siteConfig.currency)}</span>
              </div>
              <div className="flex justify-between text-brass">
                <span>{t("confirm.cod.advance")}</span>
                <span>{formatPrice(100, siteConfig.currency)}</span>
              </div>
              <div className="border-t border-line/30 pt-1.5 flex justify-between font-bold text-cream">
                <span>{t("checkout.cod.dueOnDelivery")}</span>
                <span className="text-ember">{formatPrice(Math.max(0, subtotal + 50 - 100), siteConfig.currency)}</span>
              </div>
              <p className="mt-2.5 border-t border-line/30 pt-2 text-[11px] leading-relaxed text-ash/60">
                {t("checkout.cod.advanceNote")}
              </p>
            </div>
          )}

          <div className="mt-6">
            {paymentMethod === "online" ? (
              <button
                type="button"
                onClick={handlePay}
                disabled={status !== "idle"}
                className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
              >
                {status === "idle" && t("checkout.pay")}
                {status === "creating" && t("checkout.preparing")}
                {status === "paying" && t("checkout.waiting")}
                {status === "verifying" && t("checkout.confirming")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCOD}
                disabled={status !== "idle"}
                className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
              >
                {status === "idle" && t("checkout.cod")}
                {status === "creating_cod" && t("checkout.placingOrder")}
                {status === "paying" && t("checkout.waiting")}
                {status === "verifying" && t("checkout.confirming")}
              </button>
            )}
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
