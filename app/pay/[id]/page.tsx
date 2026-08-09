import { notFound, redirect } from "next/navigation";
import { getPendingOrder } from "@/lib/pending-orders";
import { getOrderById } from "@/lib/orders";
import { buildAppLinks, buildUpiQrDataUrl, getUpiConfig, makeAttemptId, makeTxnRef } from "@/lib/upi";
import { savePendingOrder } from "@/lib/pending-orders";
import { siteConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { getT } from "@/lib/i18n-server";
import PaymentPanel from "@/components/PaymentPanel";

// A dedicated payment page, the way a hosted gateway does it: the customer
// leaves the checkout form behind and lands somewhere whose only job is
// taking the payment.
//
// The QR and the deep links are rebuilt HERE, on the server, from the
// pending order — not passed through the browser. That has three payoffs:
// the page survives a refresh, it can be reopened from history or a second
// device, and the amount can't be tampered with in transit because it never
// travels as editable client state.
export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: { id: string } }) {
  const t = getT();

  // Already placed? Then this page has done its job — send them on rather
  // than inviting a second payment for the same order.
  const placed = await getOrderById(params.id);
  if (placed) redirect(`/order/${params.id}/confirmation`);

  const pending = getPendingOrder(params.id);
  if (!pending) notFound();

  const upiConfig = getUpiConfig();
  if (!upiConfig) notFound();

  const note = `${siteConfig.name} order ${pending.id.slice(0, 8)}`.replace(/[^A-Za-z0-9 ]/g, "");

  // A fresh reference on every load of this page, so a customer who fails
  // and reloads is making a genuinely new attempt rather than resending one
  // the bank has already seen and may refuse. The JIVA<order> prefix is
  // unchanged, so the order is still identifiable on a bank statement.
  const txnRef = makeTxnRef(pending.id, makeAttemptId());

  // Recorded against the pending order so the admin panel shows the exact
  // reference that was last put in front of the customer.
  savePendingOrder({ ...pending, razorpayOrderId: txnRef, updatedAt: new Date().toISOString() });

  const links = buildAppLinks({ amount: pending.amount, note, txnRef });
  const qrDataUrl = await buildUpiQrDataUrl(links.any);

  const itemCount = pending.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = pending.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <section className="mx-auto max-w-lg px-5 py-10 sm:px-8 sm:py-14">
      {/* Gateway-style header: who is being paid, and how much. */}
      <div className="rounded-t-sm border border-line/60 bg-slate/60 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
              {t("pay.payingTo")}
            </p>
            <p className="mt-1 font-display text-lg text-cream">{siteConfig.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
              {t("pay.orderRef")}
            </p>
            <p className="mt-1 font-mono text-xs text-ash">#{pending.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Order summary — deliberately no address or phone. Anyone holding
          this link can open the page, so it shows only what's needed to
          recognise the order, never the customer's personal details. */}
      <div className="border-x border-line/60 bg-slate/30 px-5 py-4 sm:px-6">
        <div className="space-y-2">
          {pending.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="font-body text-sm text-ash">
                {item.name}
                <span className="text-ash/60"> ×{item.quantity}</span>
              </span>
              <span className="whitespace-nowrap font-body text-sm text-cream">
                {formatPrice(item.price * item.quantity, pending.currency)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-line/30 pt-2.5">
          <span className="font-body text-sm text-ash">{t("pay.delivery")}</span>
          <span className="font-body text-sm text-cream">
            {formatPrice(pending.amount - subtotal, pending.currency)}
          </span>
        </div>
      </div>

      <PaymentPanel
        session={{
          localOrderId: pending.id,
          amount: pending.amount,
          currency: pending.currency,
          txnRef,
          qrDataUrl,
          links,
          payeeVpa: upiConfig.vpa,
          payeeName: upiConfig.payeeName,
        }}
        itemCount={itemCount}
      />
    </section>
  );
}
