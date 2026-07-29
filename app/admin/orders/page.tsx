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

  const paid = orders.filter((o) => o.status === "paid");
  const awaitingShipment = paid.filter((o) => !o.shipped);

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
          {paid.length} paid · {orders.length} total
        </p>
      </div>

      {error && (
        <p className="mt-8 rounded-sm border border-ember/40 bg-ember/10 px-4 py-3 font-body text-sm text-ember">
          {error}
        </p>
      )}

      {!error && orders.length === 0 && (
        <p className="mt-10 font-body text-sm text-ash">
          No orders yet. They appear here — and in the Orders tab of your Google
          Sheet — the moment someone checks out.
        </p>
      )}

      <div className="mt-8 space-y-5">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
