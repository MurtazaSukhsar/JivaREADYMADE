import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  if (!order) notFound();

  return (
    <section className="mx-auto max-w-lg px-5 py-24 sm:px-8">
      {order.status === "paid" ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-ember">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Payment confirmed
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">Thank you</h1>
          <p className="mt-2 font-body text-sm text-ash">
            Order <span className="font-mono text-cream">{order.id.slice(0, 8)}</span> is
            confirmed.
          </p>
        </>
      ) : order.status === "cod_pending" ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-ember">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Cash on Delivery
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">Order Confirmed</h1>
          <p className="mt-2 font-body text-sm text-ash">
            Order <span className="font-mono text-cream">{order.id.slice(0, 8)}</span> is
            confirmed. Please pay with cash when your package arrives.
          </p>
        </>
      ) : (
        <>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-slate px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 text-ash">
            <span className="h-1.5 w-1.5 rounded-full bg-ash" />
            Order {order.status}
          </p>
          <h1 className="mt-4 font-display text-3xl text-cream">Still waiting on payment</h1>
          <p className="mt-2 font-body text-sm text-ash">
            This order hasn&apos;t been confirmed as paid yet. If you completed a payment
            and see this, it will update automatically within a minute.
          </p>
        </>
      )}

      <div className="mt-8 divide-y divide-line/50 rounded-sm border border-line/50 bg-slate/40 px-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-3">
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

      {order.customer?.name && (
        <div className="mt-6 rounded-sm border border-line/50 bg-slate/40 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
            Delivering to
          </p>
          <p className="mt-1.5 font-body text-sm text-cream">{order.customer.name}</p>
          <p className="font-body text-sm text-ash">{order.customer.address}</p>
          <p className="font-body text-sm text-ash">
            {[order.customer.city, order.customer.pincode].filter(Boolean).join(" — ")}
          </p>
          <p className="mt-2 font-mono text-xs text-ash/70">
            We&apos;ll message {order.customer.phone} on WhatsApp when it ships.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-widest2 text-ash">
          {order.status === "cod_pending" ? "Total to pay" : "Total paid"}
        </p>
        <p className="font-display text-2xl text-cream">
          {formatPrice(order.amount, siteConfig.currency)}
        </p>
      </div>

      <Link
        href="/shop"
        className="mt-8 block rounded-sm border border-line px-6 py-3 text-center font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:border-ember hover:text-ember"
      >
        Continue shopping
      </Link>
    </section>
  );
}
