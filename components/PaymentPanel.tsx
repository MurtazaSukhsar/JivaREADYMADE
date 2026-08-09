"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

export type PaymentSession = {
  localOrderId: string;
  amount: number;
  currency: string;
  txnRef: string;
  qrDataUrl: string;
  links: { any: string; gpay: string; phonepe: string; paytm: string };
  payeeVpa: string;
  payeeName: string;
};

/**
 * The interactive half of the payment page. Two routes to the same payment:
 *
 *   • On a phone — buttons that open GPay / PhonePe / Paytm directly with the
 *     amount already filled in. One tap, nothing to type.
 *   • On a computer — the QR, scanned with the phone in their hand. UPI apps
 *     are phone-only, so there is genuinely nothing to click here; the
 *     numbered steps exist so that isn't mistaken for a broken button.
 *
 * Both encode the identical `upi://pay?…&am=<amount>` string, so the figure
 * arrives locked in either way.
 */
export default function PaymentPanel({
  session,
  itemCount,
}: {
  session: PaymentSession;
  itemCount: number;
}) {
  const router = useRouter();
  const { clear } = useCart();
  const { t } = useLanguage();

  const [upiRef, setUpiRef] = useState("");
  const [refError, setRefError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  // Phones only. The QR is the escape hatch for customers whose bank blocks
  // the one-tap app handoff — hidden until asked for, so it doesn't clutter
  // the path for the majority for whom the buttons just work.
  const [showQr, setShowQr] = useState(false);

  // Custom URL schemes (tez://, phonepe://) do nothing on a laptop, so the
  // one-tap buttons are only offered where they can actually work. Checked
  // after mount because there is no `navigator` during server rendering.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/android|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(session.payeeVpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, old browser) — the UPI ID is on
      // screen and selectable, so this is a nicety, not a requirement.
    }
  };

  const submit = async () => {
    const clean = upiRef.trim();
    // Empty is allowed on purpose — see confirmUpiSchema in lib/validation.ts.
    // Only clearly malformed input is rejected, so someone who can't find
    // their reference number can still complete the order.
    if (clean.length > 0 && !/^[A-Za-z0-9]{6,35}$/.test(clean)) {
      setRefError(t("err.upiRef"));
      return;
    }
    setRefError(null);
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localOrderId: session.localOrderId, upiRef: clean }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("err.couldNotStart"));
        setBusy(false);
        return;
      }

      // Cleared only now, not on the way into this page — if they'd backed
      // out instead, an emptied cart would have meant rebuilding the whole
      // order by hand.
      clear();
      router.push(`/order/${data.orderId}/confirmation`);
    } catch {
      setError(t("err.unconfirmed"));
      setBusy(false);
    }
  };

  return (
    <div className="rounded-b-sm border-x border-b border-line/60 bg-slate/40 px-5 py-6 sm:px-6">
      {/* The number they're about to send. Biggest thing on the page — it's
          what they'll check against their payment app before confirming. */}
      <div className="flex items-baseline justify-between gap-3 border-b border-line/40 pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80">
            {t("checkout.upi.amount")}
          </span>
          <p className="mt-0.5 font-body text-xs text-ash/60">
            {t("common.qty", { n: itemCount })}
          </p>
        </div>
        <span className="font-display text-3xl text-cream">
          {formatPrice(session.amount, session.currency)}
        </span>
      </div>
      <p className="mt-2.5 font-body text-xs leading-relaxed text-ash/70">
        {t("checkout.upi.amountNote")}
      </p>

      {/* --- phones: one tap into a payment app --- */}
      {/*
        Ordering here is a judgement call, not a detail.

        Tapping an app button is an *intent*-initiated transaction; scanning
        a QR is a QR-initiated one. Some banks refuse intent transfers to a
        personal VPA (error U1600922 — "intent-based transfers between these
        accounts are currently not allowed"), so the button genuinely fails
        for some customers.

        But that block depends on the account pair, so it does NOT affect
        everyone — and the alternative (save the image, open an app, tap
        scan, open the gallery, pick the file) is five steps that will lose
        far more customers than the block does. So: one tap first, scanning
        kept one tap away for whoever needs it.
      */}
      {isMobile && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
            {t("checkout.upi.openApp")}
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <AppButton href={session.links.gpay} label="Google Pay" primary />
            <AppButton href={session.links.phonepe} label="PhonePe" primary />
            <AppButton href={session.links.paytm} label="Paytm" />
            <AppButton href={session.links.any} label={t("checkout.upi.otherApp")} />
          </div>

          <button
            type="button"
            onClick={() => setShowQr((v) => !v)}
            className="mt-3 w-full rounded-sm border border-line/50 py-2.5 font-mono text-[10px] uppercase tracking-widest2 text-ash transition-colors hover:border-ember hover:text-ember"
          >
            {showQr ? t("checkout.upi.hideQr") : t("checkout.upi.didntWork")}
          </button>
        </div>
      )}

      {/* --- the QR: always shown on desktop, on demand on phones --- */}
      {(!isMobile || showQr) && (
      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
          {t("checkout.upi.scan")}
        </p>

        <ol className="mt-2.5 space-y-1 font-body text-xs leading-relaxed text-ash/80">
          {isMobile ? (
            <>
              <li>{t("checkout.upi.mobileStep1")}</li>
              <li>{t("checkout.upi.mobileStep2")}</li>
              <li>{t("checkout.upi.mobileStep3")}</li>
            </>
          ) : (
            <>
              <li>{t("checkout.upi.desktopStep1")}</li>
              <li>{t("checkout.upi.desktopStep2")}</li>
              <li>{t("checkout.upi.desktopStep3")}</li>
            </>
          )}
        </ol>

        <div className="mt-3 flex flex-col items-center gap-3 rounded-sm border border-line/50 bg-carbon/60 p-5">
          {/* unoptimized: it's already a data URL — there is nothing for the
              image optimiser to fetch or cache. The QR is deliberately
              light-backed (see lib/upi.ts) because inverted codes don't scan
              reliably, so it sits on its own pale tile. */}
          <Image
            src={session.qrDataUrl}
            alt={t("checkout.upi.qrAlt")}
            width={224}
            height={224}
            unoptimized
            className="rounded-sm bg-cream p-2"
          />
          <div className="text-center">
            <p className="font-body text-sm text-cream">{session.payeeName}</p>
            <button
              type="button"
              onClick={copyVpa}
              className="mt-1 select-all font-mono text-xs text-ash transition-colors hover:text-ember"
            >
              {session.payeeVpa}
              <span className="ml-2 text-[10px] uppercase tracking-widest2 text-ember">
                {copied ? t("checkout.upi.copied") : t("checkout.upi.copy")}
              </span>
            </button>
          </div>

          {/* On a phone you can't scan your own screen, so the way through is
              to save the image and use the payment app's "scan from gallery"
              option. `download` on a data: URL saves straight to the gallery. */}
          {isMobile && (
            <a
              href={session.qrDataUrl}
              download={`payment-${session.txnRef}.png`}
              className="w-full rounded-sm bg-ember py-3 text-center font-mono text-[11px] uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110"
            >
              {t("checkout.upi.saveQr")}
            </a>
          )}
        </div>
      </div>
      )}

      {/* --- tell us it went through --- */}
      <div className="mt-6 border-t border-line/40 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
          {t("checkout.upi.afterPaying")}
        </p>
        <p className="mt-2 font-body text-xs leading-relaxed text-ash/80">
          {t("checkout.upi.refHelp")}
        </p>

        <label className="mt-3 block">
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/80">
            {t("checkout.upi.refLabel")}{" "}
            <span className="text-ash/50">{t("checkout.upi.refOptional")}</span>
          </span>
          <input
            value={upiRef}
            onChange={(e) => {
              setUpiRef(e.target.value);
              setRefError(null);
            }}
            placeholder="123456789012"
            inputMode="numeric"
            autoComplete="off"
            className="input mt-1.5"
          />
        </label>
        {refError && <p className="mt-1 font-body text-xs text-ember">{refError}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
        >
          {busy ? t("checkout.upi.submitting") : t("checkout.upi.submit")}
        </button>

        <button
          type="button"
          onClick={() => router.push("/checkout")}
          disabled={busy}
          className="mt-3 w-full font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream disabled:opacity-50"
        >
          {t("pay.cancel")}
        </button>

        {error && (
          <p className="mt-4 rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
            {error}
          </p>
        )}

        <p className="mt-4 border-t border-line/30 pt-3 font-body text-[11px] leading-relaxed text-ash/60">
          {t("checkout.upi.verifyNote")}
        </p>
      </div>
    </div>
  );
}

function AppButton({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={`rounded-sm px-3 py-3.5 text-center font-mono text-[11px] uppercase tracking-widest2 transition-all duration-200 ${
        primary
          ? "bg-ember text-carbon hover:shadow-glow hover:brightness-110"
          : "border border-line/60 text-cream hover:border-ember hover:text-ember"
      }`}
    >
      {label}
    </a>
  );
}
