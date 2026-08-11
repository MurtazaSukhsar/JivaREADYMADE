"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getDeliveryFee, getCodAdvance } from "@/lib/format";
import { siteConfig } from "@/lib/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";

// The Cashfree v3 SDK exposes a single global factory. Calling it returns a
// checkout instance bound to one environment — the mode must match the one
// the payment session was created in on the server, so it's sent back with
// the session rather than hardcoded here.
type CashfreeCheckoutResult = {
  error?: { message?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
};

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: string;
  }) => Promise<CashfreeCheckoutResult>;
};

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

// What the server hands back from either create-order route.
type CashfreeSession = {
  localOrderId: string;
  paymentSessionId: string;
  mode: "sandbox" | "production";
};

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

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = getDeliveryFee(totalQty);
  const advanceAmount = getCodAdvance(totalQty);
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

  // Both create-order routes take the same body: slugs and quantities only,
  // never prices. The server looks every price up in the catalog.
  const orderPayload = () => ({
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
  });

  /**
   * Opens the Cashfree modal, then asks OUR server what happened.
   *
   * The SDK resolves with its own success/error object, and it's tempting to
   * branch on that — but it runs in the customer's browser, so it proves
   * nothing. We throw it away and hit /verify-cashfree, which checks with
   * Cashfree server-to-server. That also means a payment that succeeded while
   * the modal reported a hiccup still lands correctly.
   *
   * Shared by the full-payment and COD-advance flows; they differ only in
   * which route minted the session.
   */
  const runCashfreeCheckout = async (session: CashfreeSession) => {
    if (!scriptReady || !window.Cashfree) {
      setError(t("err.scriptNotReady"));
      setStatus("idle");
      return;
    }

    setStatus("paying");

    const cashfree = window.Cashfree({ mode: session.mode });
    await cashfree.checkout({
      paymentSessionId: session.paymentSessionId,
      // Keeps the customer on our page instead of bouncing them to a hosted
      // checkout and back.
      redirectTarget: "_modal",
    });

    setStatus("verifying");

    const verifyRes = await fetch("/api/checkout/verify-cashfree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ localOrderId: session.localOrderId }),
    });
    const verified = await verifyRes.json();

    if (!verifyRes.ok) {
      setError(verified.error ?? t("err.notVerified"));
      setStatus("idle");
      return;
    }

    // Cleared only once the payment is confirmed — if they'd abandoned the
    // modal instead, everything they picked is still in the cart.
    clear();
    router.push(`/order/${verified.orderId}/confirmation`);
  };

  // Paying the full amount online: card, UPI, netbanking or wallet, all
  // through Cashfree's modal.
  const handleOnline = async () => {
    setError(null);

    const errors = validate(customer);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(t("err.checkFields"));
      return;
    }

    setStatus("creating");

    try {
      const createRes = await fetch("/api/checkout/create-cashfree-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload()),
      });
      const created = await createRes.json();

      if (!createRes.ok) {
        setError(created.error ?? t("err.couldNotStart"));
        setStatus("idle");
        return;
      }

      await runCashfreeCheckout(created as CashfreeSession);
    } catch {
      setError(t("err.unconfirmed"));
      setStatus("idle");
    }
  };

  // Cash on Delivery still takes a small advance online — same Cashfree
  // modal, smaller amount. The server decides how much and marks the order
  // "cod_pending" rather than "paid", because the balance is owed at the door.
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
        body: JSON.stringify(orderPayload()),
      });
      const created = await createRes.json();

      if (!createRes.ok) {
        setError(created.error ?? t("err.couldNotStart"));
        setStatus("idle");
        return;
      }

      await runCashfreeCheckout(created as CashfreeSession);
    } catch {
      setError(t("err.unconfirmed"));
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
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      <h1 className="font-display text-3xl text-cream">{t("checkout.title")}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* --- delivery details --- */}
        <div className="rounded-sm border border-line/60 bg-slate/40 p-6 sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-cream">
            {t("checkout.deliveryDetails")}
          </p>
          <p className="mt-2 font-body text-xs text-ash">{t("checkout.whatsappNote")}</p>

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
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
            {t("checkout.orderSummary")}
          </p>

          <div className="mt-3 divide-y divide-line/50 rounded-sm border border-line/50 bg-slate/40 px-4">
            {items.map((item) => (
              <div key={`${item.slug}-${item.size}-${item.color}`} className="flex justify-between py-3">
                <div>
                  <p className="font-body text-sm text-cream">{item.name}</p>
                  <p className="font-mono text-xs text-ash">
                    {t("common.qty", { n: item.quantity })} {item.size ? `· ${item.size}` : ""} {item.color ? `· ${item.color}` : ""}
                  </p>
                </div>
                <p className="font-body text-sm text-cream">
                  {formatPrice(item.price * item.quantity, siteConfig.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 border-t border-line/30 pt-3">
            <div className="flex justify-between text-sm">
              <span className="font-mono uppercase tracking-widest2 text-ash">{t("confirm.cod.price")}</span>
              <span className="font-body text-cream">{formatPrice(subtotal, siteConfig.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-mono uppercase tracking-widest2 text-ash">{t("confirm.cod.courier")}</span>
              <span className="font-body text-cream">{formatPrice(deliveryFee, siteConfig.currency)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-line/30">
              <span className="font-mono text-sm uppercase tracking-widest2 text-ash">{t("common.total")}</span>
              <span className="font-display text-2xl text-cream">{formatPrice(subtotal + deliveryFee, siteConfig.currency)}</span>
            </div>
          </div>
          <p className="mt-1.5 font-body text-xs text-ash">{t("checkout.estimateNote")}</p>

          <div className="mt-6 border-t border-line/60 pt-5">
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash mb-3">
              {t("checkout.paymentMethod")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Full amount online through Cashfree — cards, UPI, netbanking,
                  wallets. Listed first because it's the only option that
                  confirms itself: no QR to scan, no reference to type, no
                  human checking a bank statement afterwards. */}
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
                <span className="mt-1.5 block font-body text-[10px] text-ash leading-normal">
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
                <span className="mt-1.5 block font-body text-[10px] text-ash leading-normal">
                  {t("checkout.method.codSub", { advance: formatPrice(advanceAmount, siteConfig.currency) })}
                </span>
              </button>
            </div>
          </div>

          {paymentMethod === "cod" && (
            <div className="mt-5 rounded-sm border border-line/50 bg-slate/20 px-3.5 py-3 font-body text-xs text-ash space-y-1.5 transition-all duration-200">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-cream">
                {t("checkout.cod.terms")}
              </p>
              <div className="flex justify-between">
                <span>{t("confirm.cod.price")}</span>
                <span className="text-cream">{formatPrice(subtotal, siteConfig.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("confirm.cod.courier")}</span>
                <span className="text-cream">{formatPrice(deliveryFee, siteConfig.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-cream">
                <span>{t("confirm.cod.total")}</span>
                <span>{formatPrice(subtotal + deliveryFee, siteConfig.currency)}</span>
              </div>
              <div className="flex justify-between text-cream">
                <span>{t("confirm.cod.advance")}</span>
                <span>{formatPrice(advanceAmount, siteConfig.currency)}</span>
              </div>
              <div className="border-t border-line/30 pt-1.5 flex justify-between font-bold text-cream">
                <span>{t("checkout.cod.dueOnDelivery")}</span>
                <span className="text-cream">{formatPrice(Math.max(0, subtotal + deliveryFee - advanceAmount), siteConfig.currency)}</span>
              </div>
              <p className="mt-2.5 border-t border-line/30 pt-2 text-[11px] leading-relaxed text-ash">
                {t("checkout.cod.advanceNote", { advance: formatPrice(advanceAmount, siteConfig.currency) })}
              </p>
            </div>
          )}

          <div className="mt-6">
            {paymentMethod === "online" ? (
              <button
                type="button"
                onClick={handleOnline}
                disabled={status !== "idle"}
                className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
              >
                {status === "idle" && t("checkout.payOnline")}
                {status === "creating" && t("checkout.preparing")}
                {status === "creating_cod" && t("checkout.openingPayment")}
                {status === "paying" && t("checkout.waiting")}
                {status === "verifying" && t("checkout.confirming")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCOD}
                disabled={status !== "idle"}
                className="w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
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
      <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block font-body text-xs text-ember">{error}</span>}
    </label>
  );
}
