"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { shippedMessage, whatsAppLink } from "@/lib/whatsapp";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState(() => shippedMessage(order));

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
    order.status === "paid"
      ? "border-brass/40 bg-brass/10 text-brass"
      : order.status === "failed"
        ? "border-ember/40 bg-ember/10 text-ember"
        : "border-line bg-slate text-ash";

  return (
    <article className="rounded-sm border border-line/60 bg-slate/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ash/70">
            #{order.id.slice(0, 8)} · {formatDate(order.createdAt)}
          </p>
          <p className="mt-1 font-display text-xl text-cream">{order.customer.name || "—"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 ${statusTone}`}
          >
            {order.status}
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
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
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
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
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
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
              Total
            </span>
            <span className="font-body text-sm text-cream">
              {formatPrice(order.amount, order.currency)}
            </span>
          </div>
          {order.razorpayPaymentId && (
            <p className="mt-1 font-mono text-[11px] text-ash/60">
              Payment {order.razorpayPaymentId}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line/50 pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => toggleShipped(!shipped)}
          className={`rounded-sm px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest2 transition-all duration-200 disabled:opacity-50 ${
            shipped
              ? "border border-line text-ash hover:border-ash hover:text-cream"
              : "bg-ember text-carbon hover:shadow-glow hover:brightness-110"
          }`}
        >
          {busy ? "Saving…" : shipped ? "Undo shipped" : "Mark shipped"}
        </button>

        <a
          href={whatsAppLink(order.customer.phone, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm border border-ember/60 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest2 text-ember transition-all duration-200 hover:bg-ember hover:text-carbon"
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
              onClick={() => setMessage(shippedMessage(order))}
              className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
            >
              Reset to template
            </button>
            <span className="font-body text-xs text-ash/60">
              Edits apply to this order only — change the default in lib/whatsapp.ts.
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-sm border border-ember/40 bg-ember/10 px-3 py-2 font-body text-xs text-ember">
          {error}
        </p>
      )}
    </article>
  );
}
