import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPrice, getDeliveryFee, getCodAdvance, isCodOrder } from "@/lib/format";
import { siteConfig } from "@/lib/config";
import { getT } from "@/lib/i18n-server";
import type { TranslationKey } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  if (!order) notFound();

  const t = getT();
  // "created" / "paid" / "failed" are sheet values, so they get looked up
  // rather than shown raw to a customer.
  const statusLabel = t(`status.${order.status}` as TranslationKey);

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = getDeliveryFee(totalQty);
  const advanceAmount = getCodAdvance(totalQty);

  return (
    <section className="mx-auto max-w-lg px-5 py-24 sm:px-8">
      {order.status === "paid" ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-ember">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            {t("confirm.paid")}
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">{t("confirm.thankYou")}</h1>
          <p className="mt-2 font-body text-sm text-ash">
            {t("confirm.orderConfirmed", { id: order.id.slice(0, 8) })}
          </p>
        </>
      ) : order.status === "upi_pending" ? (
        /* Paid by UPI QR. The money is very likely in the account, but
           nothing has checked it yet — so this deliberately says "received",
           not "confirmed". Overpromising here means angry WhatsApp messages
           when a payment turns out to have failed. */
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-brass">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" />
            {t("confirm.upiPending")}
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">{t("confirm.upiTitle")}</h1>
          <p className="mt-2 font-body text-sm text-ash">
            {t("confirm.upiBody", { id: order.id.slice(0, 8) })}
          </p>
          {order.razorpayPaymentId && (
            <p className="mt-3 font-mono text-xs text-ash/70">
              {t("confirm.upiRef")}:{" "}
              <span className="select-all text-cream">{order.razorpayPaymentId}</span>
            </p>
          )}
        </>
      ) : isCodOrder(order) ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-ember">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            {t("checkout.cod")}
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">{t("confirm.codTitle")}</h1>
          <p className="mt-2 font-body text-sm text-ash">
            {t("confirm.codBody", { id: order.id.slice(0, 8) })}
          </p>
        </>
      ) : (
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-slate px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-ash">
            <span className="h-1.5 w-1.5 rounded-full bg-ash" />
            {t("confirm.orderStatus", { status: statusLabel })}
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">
            {t("confirm.waitingTitle")}
          </h1>
          <p className="mt-2 font-body text-sm text-ash">{t("confirm.waitingBody")}</p>
        </>
      )}

      <div className="mt-8 divide-y divide-line/50 rounded-sm border border-line/50 bg-slate/40 px-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-3">
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

      {order.customer?.name && (
        <div className="mt-6 rounded-sm border border-line/50 bg-slate/40 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
            {t("confirm.deliveringTo")}
          </p>
          <p className="mt-1.5 font-body text-sm text-cream">{order.customer.name}</p>
          <p className="font-body text-sm text-ash">{order.customer.address}</p>
          <p className="font-body text-sm text-ash">
            {[order.customer.city, order.customer.pincode].filter(Boolean).join(" — ")}
          </p>
          <p className="mt-2 font-mono text-xs text-ash/70">
            {t("confirm.whatsappNote", { phone: order.customer.phone })}
          </p>
        </div>
      )}

      {isCodOrder(order) ? (
        <div className="mt-6 rounded-sm border border-line/50 bg-slate/40 px-4 py-4 space-y-3 font-body text-sm text-ash">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
            {t("confirm.cod.breakdown")}
          </p>
          <div className="flex justify-between">
            <span>{t("confirm.cod.price")}</span>
            <span className="text-cream">{formatPrice(subtotal, siteConfig.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("confirm.cod.courier")}</span>
            <span className="text-cream">{formatPrice(deliveryFee, siteConfig.currency)}</span>
          </div>
          <div className="border-t border-line/40 pt-2 flex justify-between font-semibold text-cream">
            <span>{t("confirm.cod.total")}</span>
            <span>{formatPrice(subtotal + deliveryFee, siteConfig.currency)}</span>
          </div>
          <div className="flex justify-between text-brass">
            <span>{t("confirm.cod.advance")}</span>
            <span>{formatPrice(advanceAmount, siteConfig.currency)}</span>
          </div>
          <div className="border-t border-line/40 pt-2 flex justify-between font-bold text-cream text-lg">
            <span>{t("confirm.cod.deliveryPay")}</span>
            <span className="text-ember">{formatPrice(Math.max(0, subtotal + deliveryFee - advanceAmount), siteConfig.currency)}</span>
          </div>
          <p className="mt-3 border-t border-line/30 pt-2.5 text-xs leading-relaxed text-ash/60">
            {t("confirm.cod.advanceNote", {
              advance: formatPrice(advanceAmount, siteConfig.currency),
              due: formatPrice(Math.max(0, subtotal + deliveryFee - advanceAmount), siteConfig.currency),
            })}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-sm border border-line/50 bg-slate/40 px-4 py-4 space-y-3 font-body text-sm text-ash">
          <div className="flex justify-between">
            <span>{t("confirm.cod.price")}</span>
            <span className="text-cream">{formatPrice(subtotal, siteConfig.currency)}</span>
          </div>
          {order.amount - subtotal > 0 && (
            <div className="flex justify-between">
              <span>{t("confirm.cod.courier")}</span>
              <span className="text-cream">{formatPrice(order.amount - subtotal, siteConfig.currency)}</span>
            </div>
          )}
          <div className="border-t border-line/40 pt-2 flex justify-between font-bold text-cream text-lg">
            <span>{t("confirm.totalPaid")}</span>
            <span className="text-ember">{formatPrice(order.amount, siteConfig.currency)}</span>
          </div>
        </div>
      )}

      <Link
        href="/shop"
        className="mt-8 block rounded-sm border border-line px-6 py-3 text-center font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:border-ember hover:text-ember"
      >
        {t("confirm.continue")}
      </Link>
    </section>
  );
}
