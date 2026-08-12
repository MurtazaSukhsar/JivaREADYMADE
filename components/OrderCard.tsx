"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { formatPrice, isCodOrder, getDeliveryFee, getCodAdvance } from "@/lib/format";
import { paymentReceivedMessage, shippedMessage, whatsAppLink } from "@/lib/whatsapp";
import { LANGUAGES } from "@/lib/i18n";

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [shipped, setShipped] = useState(order.shipped);
  const [status, setStatus] = useState(order.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  // Cash-on-delivery vs paid-in-full — shown as a badge and also what
  // decides which WhatsApp breakdown (advance + due, or a straight total)
  // is actually correct for this order.
  const cod = isCodOrder(order);

  // Courier AWB number. Kept as its own field on the order, editable
  // independently of the shipped toggle — the shop owner often gets this
  // from the courier before or after actually marking the order shipped.
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);

  // Which reference (if either) was just copied — used to flash "Copied" on
  // the right button without a separate boolean per field.
  const [copiedField, setCopiedField] = useState<"order" | "payment" | null>(null);
  const copyRef = async (field: "order" | "payment", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Clipboard blocked — the value is selectable text either way.
    }
  };

  const saveTracking = async () => {
    setTrackingSaving(true);
    setError(null);
    setTrackingSaved(false);
    try {
      const res = await fetch(`/api/orders/${order.id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the tracking number.");
        return;
      }
      setTrackingSaved(true);
      setTimeout(() => setTrackingSaved(false), 2000);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setTrackingSaving(false);
    }
  };

  // Whichever tracking number is currently in the input — saved or not —
  // is what both messages should quote, so the admin sees exactly what
  // they're about to send rather than a stale saved value. Matters for the
  // payment message too: if the order already shipped before this message
  // went out, it should show the real tracking number, not "coming soon".
  const orderForMessage = { ...order, trackingNumber: trackingNumber.trim() || undefined };

  // Step 1 is always "payment received", step 2 is "shipped" — that's the
  // real order these two messages go out in, so the UI walks the admin
  // through it in that sequence instead of presenting two equal, unordered
  // tabs. The tracking number only matters for step 2, so it stays hidden
  // until that step is selected.
  const [messageType, setMessageType] = useState<"payment" | "shipped">(
    order.shipped ? "shipped" : "payment"
  );
  const [message, setMessage] = useState(() =>
    messageType === "shipped" ? shippedMessage(orderForMessage) : paymentReceivedMessage(orderForMessage)
  );

  const applyTemplate = (type: "payment" | "shipped") => {
    setMessageType(type);
    setMessage(type === "shipped" ? shippedMessage(orderForMessage) : paymentReceivedMessage(orderForMessage));
  };

  // UPI QR payments arrive with no confirmation from the bank — the customer
  // just types in the reference number their app showed them. So this order
  // is a *claim* of payment until someone checks the account and presses the
  // button below.
  const awaitingUpiCheck = status === "upi_pending";

  // A COD order sits in "cod_pending" forever unless someone tells the site
  // the courier actually collected the rest at the door — there's no bank
  // webhook for cash changing hands in person, so this is a manual flip,
  // same shape as the UPI check above.
  const awaitingCodBalance = cod && status === "cod_pending";
  const codSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const codQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const codDeliveryFee = getDeliveryFee(codQty);
  const codAdvance = getCodAdvance(codQty);
  const codBalanceDue = Math.max(0, codSubtotal + codDeliveryFee - codAdvance);

  const markPaid = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not mark the order paid.");
        return;
      }
      setStatus("paid");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const toggleShipped = async (next: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipped: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update the order.");
        return;
      }
      setShipped(next);
      router.refresh(); // keep the sheet and the page in step
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const statusTone =
    status === "paid"
      ? "border-brass/40 bg-brass/10 text-brass"
      : status === "failed"
        ? "border-ember/40 bg-ember/10 text-ember"
        : status === "upi_pending"
          ? "border-ember/50 bg-ember/10 text-ember"
          : "border-line bg-slate text-ash";

  return (
    <article className="rounded-sm border border-line/60 bg-slate/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ash">
            #{order.id.slice(0, 8)} · {formatDate(order.createdAt)}
          </p>
          <p className="mt-1 font-display text-xl text-cream">{order.customer.name || "—"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 ${
              cod ? "border-brass/40 bg-brass/10 text-brass" : "border-line bg-slate text-ash"
            }`}
          >
            {cod ? "COD" : "Prepaid"}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 ${statusTone}`}
          >
            {status === "upi_pending" ? "UPI · check bank" : status}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 ${
              shipped ? "border-ember/40 bg-ember/10 text-ember" : "border-line bg-slate text-ash"
            }`}
          >
            {shipped ? "Shipped" : "Not shipped"}
          </span>
          {/* which language the WhatsApp message below will be written in */}
          <span className="rounded-full border border-line bg-slate px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 text-ash">
            {LANGUAGES.find((l) => l.code === order.customer.language)?.short ?? "EN"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
            Ship to
          </p>
          <div className="mt-2 space-y-0.5 font-body text-sm text-cream">
            <p>{order.customer.address || "—"}</p>
            <p className="text-ash">
              {[order.customer.city, order.customer.state, order.customer.pincode].filter(Boolean).join(" — ") || "—"}
            </p>
          </div>
          <div className="mt-3 space-y-0.5 font-mono text-xs text-ash">
            <p>{order.customer.phone || "no phone"}</p>
            <p className="break-all">{order.customer.email || "no email"}</p>
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
            Items
          </p>
          <ul className="mt-2 space-y-1 font-body text-sm text-cream">
            {order.items.length === 0 && <li className="text-ash">—</li>}
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {item.name} <span className="text-ash">x{item.quantity}</span>
                  {[item.size, item.color].filter(Boolean).length > 0 && (
                    <span className="text-ash">
                      {" "}
                      ({[item.size, item.color].filter(Boolean).join(" / ")})
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap font-body text-xs text-ash">
                  {formatPrice(item.price * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2">
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
              Total
            </span>
            <span className="font-body text-sm text-cream">
              {formatPrice(order.amount, order.currency)}
            </span>
          </div>
          {/* Same IDs Cashfree shows on their dashboard — the Order ID here
              is the exact string Cashfree has for this order (we send our
              own order id as theirs when creating it, on purpose, so there's
              never a separate mapping to look up). Search either one in
              Cashfree's dashboard to pull up this exact transaction and
              confirm the amount that actually landed. */}
          {!awaitingUpiCheck && (
            <div className="mt-3 space-y-1.5 border-t border-line/50 pt-2">
              <RefRow
                label="Cashfree Order ID"
                value={order.razorpayOrderId}
                copied={copiedField === "order"}
                onCopy={() => copyRef("order", order.razorpayOrderId)}
              />
              {order.razorpayPaymentId && (
                <RefRow
                  label="Cashfree Payment ID"
                  value={order.razorpayPaymentId}
                  copied={copiedField === "payment"}
                  onCopy={() => copyRef("payment", order.razorpayPaymentId!)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {awaitingUpiCheck && (
        <div className="mt-5 rounded-sm border border-ember/40 bg-ember/5 px-4 py-3.5">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-ember">
            Paid by UPI — needs checking
          </p>
          <p className="mt-2 font-body text-xs leading-relaxed text-ash">
            The customer says they sent{" "}
            <span className="text-cream">{formatPrice(order.amount, order.currency)}</span>. Open
            your bank or GPay history and look for this reference before you pack anything.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash">
                Their UPI reference
              </p>
              {order.razorpayPaymentId ? (
                <p className="mt-1 select-all break-all font-mono text-sm text-cream">
                  {order.razorpayPaymentId}
                </p>
              ) : (
                // The reference is optional, so this is common and not a red
                // flag on its own — match by amount and time instead.
                <p className="mt-1 font-body text-xs italic text-ash">
                  Not given — match by amount and time, or by our reference.
                </p>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash">
                Our reference (on your statement)
              </p>
              <p className="mt-1 select-all break-all font-mono text-sm text-cream">
                {order.razorpayOrderId || "—"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={markPaid}
            className="mt-3 rounded-sm bg-brass px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest2 text-cream transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Money received — mark paid"}
          </button>
        </div>
      )}

      {awaitingCodBalance && (
        <div className="mt-5 rounded-sm border border-brass/40 bg-brass/5 px-4 py-3.5">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
            COD — balance due at delivery
          </p>
          <p className="mt-2 font-body text-xs leading-relaxed text-ash">
            Advance of <span className="text-cream">{formatPrice(codAdvance, order.currency)}</span> is
            already in. Once the courier hands over{" "}
            <span className="text-cream">{formatPrice(codBalanceDue, order.currency)}</span> in cash and
            it's actually in hand, mark this paid.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={markPaid}
            className="mt-3 rounded-sm bg-brass px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest2 text-cream transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Balance collected — mark paid"}
          </button>
        </div>
      )}

      {/* Two-step message flow: step 1 always confirms the payment that just
          came in, step 2 is for once you're actually shipping — the tracking
          number belongs there and only appears once that step is picked,
          instead of sitting on screen for every order regardless of stage. */}
      <div className="mt-5 border-t border-line/50 pt-4">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          Message
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StepTab
            number={1}
            label="Payment received"
            active={messageType === "payment"}
            onClick={() => applyTemplate("payment")}
          />
          <StepTab
            number={2}
            label="Shipped"
            active={messageType === "shipped"}
            onClick={() => applyTemplate("shipped")}
          />
        </div>

        {messageType === "shipped" && (
          <div className="mt-3 rounded-sm border border-line/50 bg-night/40 p-3.5">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
                Tracking number
              </span>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. Delhivery 1234567890"
                  className="input w-56"
                />
                <button
                  type="button"
                  disabled={trackingSaving || trackingNumber.trim() === (order.trackingNumber ?? "")}
                  onClick={saveTracking}
                  className="rounded-sm border border-line px-3.5 font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:border-ember hover:text-ember disabled:opacity-40"
                >
                  {trackingSaving ? "Saving…" : trackingSaved ? "Saved" : "Save"}
                </button>
              </div>
            </label>
            <p className="mt-2 font-body text-xs text-ash">
              Type it here, hit Save, then send — it's pulled straight into the message below.
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => toggleShipped(!shipped)}
            className={`rounded-sm px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest2 transition-all duration-200 disabled:opacity-50 ${
              shipped
                ? "border border-line text-ash hover:border-ash hover:text-cream"
                : "bg-ember text-cream hover:shadow-glow hover:brightness-110"
            }`}
          >
            {busy ? "Saving…" : shipped ? "Undo shipped" : "Mark shipped"}
          </button>

          <a
            href={whatsAppLink(order.customer.phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-ember/60 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest2 text-ember transition-all duration-200 hover:bg-ember hover:text-cream"
          >
            Send WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setShowMessage((v) => !v)}
            className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
          >
            {showMessage ? "Hide message" : "Edit message"}
          </button>
        </div>

        {showMessage && (
          <div className="mt-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="input resize-y font-mono text-xs leading-relaxed"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => applyTemplate(messageType)}
                className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
              >
                Reset to template
              </button>
              <span className="font-body text-xs text-ash">
                Edits apply to this order only — change the default in lib/whatsapp.ts.
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-sm border border-ember/40 bg-ember/10 px-3 py-2 font-body text-xs text-ember">
          {error}
        </p>
      )}
    </article>
  );
}

// A labelled, full, copyable reference id — full because a truncated id is
// useless for matching against Cashfree's dashboard, and copyable because
// retyping a 20+ character id by hand is how typos get into a "did this
// payment actually match" check.
function RefRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash">{label}</p>
        <p className="select-all break-all font-mono text-xs text-cream">{value}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest2 text-ash transition-colors hover:text-ember"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// Numbered step toggle — makes the "do this, then this" order visible
// instead of presenting Payment received / Shipped as two equal, unordered
// tabs.
function StepTab({
  number,
  label,
  active,
  onClick,
}: {
  number: number;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-widest2 transition-all duration-200 ${
        active
          ? "border-ember bg-ember text-cream"
          : "border-line/60 text-ash hover:border-ash hover:text-cream"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
          active ? "bg-cream text-ember" : "bg-line/60 text-ash"
        }`}
      >
        {number}
      </span>
      {label}
    </button>
  );
}
