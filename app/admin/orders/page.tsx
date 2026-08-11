import { getAllOrders } from "@/lib/orders";
import { Order } from "@/lib/types";
import AdminNav from "@/components/AdminNav";
import OrderCard from "@/components/OrderCard";

// Always read the sheet fresh — a stale order list is worse than a slightly
// slower page when someone is packing parcels.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  let error: string | null = null;

  try {
    orders = await getAllOrders();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not read the Orders sheet.";
  }

  // "created" is written the moment someone starts checkout, before any
  // payment — that's what makes an abandoned cart recoverable, but it also
  // means most "created" rows are just people who never paid. "failed" is a
  // payment that was attempted and didn't go through. Neither belongs in the
  // working list; only statuses where money has actually moved do.
  const visibleOrders = orders.filter(
    (o) => o.status === "paid" || o.status === "cod_pending" || o.status === "upi_pending"
  );

  const paid = visibleOrders.filter((o) => o.status === "paid");
  const awaitingShipment = paid.filter((o) => !o.shipped);
  // UPI QR payments can't confirm themselves, so these are sitting waiting
  // for someone to check the bank and press "mark paid".
  const awaitingUpiCheck = visibleOrders.filter((o) => o.status === "upi_pending");

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <AdminNav />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
            Orders
          </p>
          <h1 className="mt-2 font-display text-3xl text-cream">
            {awaitingShipment.length} to ship
          </h1>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          {paid.length} paid · {visibleOrders.length} total
        </p>
      </div>

      {awaitingUpiCheck.length > 0 && (
        <p className="mt-6 rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
          {awaitingUpiCheck.length} UPI {awaitingUpiCheck.length === 1 ? "payment" : "payments"} to
          check. Match the reference against your bank, then press &ldquo;mark paid&rdquo; on the
          order.
        </p>
      )}

      {error && (
        <p className="mt-8 rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
          {error}
        </p>
      )}

      {!error && visibleOrders.length === 0 && (
        <p className="mt-10 font-body text-sm text-ash">
          No orders yet. They appear here — and in the Orders tab of your Google
          Sheet — as soon as one is paid (or a Cash on Delivery advance clears).
        </p>
      )}

      <div className="mt-8 space-y-5">
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
