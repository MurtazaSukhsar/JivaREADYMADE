import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Cancellation Policy — ${siteConfig.name}`,
  description: `Cancellation policy for ${siteConfig.legalName}. Orders cannot be cancelled once placed.`,
};

export default function CancellationPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      {/* Page heading */}
      <div className="mb-14 border-b border-line/60 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">
          Cancellation Policy
        </h1>
        <p className="mt-4 font-mono text-[11px] text-ash/50">
          Effective date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex flex-col gap-10">

        {/* No Cancellation */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            1. Orders Are Non-Cancellable
          </p>
          <div className="rounded-sm border border-line/60 bg-slate/20 px-6 py-5">
            <p className="font-body text-sm leading-relaxed text-cream font-semibold">
              No cancellations are accepted under any circumstances.
            </p>
            <p className="mt-3 font-body text-sm leading-relaxed text-ash">
              Once an order is successfully placed on our platform, it enters fulfilment
              immediately. {siteConfig.legalName} does not permit order cancellation for any reason,
              including but not limited to:
            </p>
            <ul className="mt-4 flex flex-col gap-2 pl-4">
              {[
                "Change of mind after placing the order",
                "Accidental or duplicate orders",
                "Delays in expected delivery timeline",
                "Financial reasons or budget changes",
                "Orders placed during sales or promotional events",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 font-body text-sm text-ash">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-ember" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            2. Why We Do Not Allow Cancellations
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            Our garments are prepared and dispatched on a tight schedule to ensure
            timely delivery. The moment your order is confirmed, warehouse operations
            begin — making it impractical to halt fulfilment midway. We encourage all
            customers to review their cart, size selection, and shipping details carefully
            before completing a purchase.
          </p>
        </section>

        {/* Pre-purchase guidance */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            3. Before You Order
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            To avoid any post-purchase regret, we strongly recommend:
          </p>
          <ul className="mt-4 flex flex-col gap-2 pl-4">
            {[
              "Consulting our size guide before selecting a size",
              "Double-checking the shipping address you enter at checkout",
              "Reviewing item details and photographs thoroughly",
              "Contacting us with any product queries before placing an order",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-ash">
                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-ember" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Payment Issues */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            4. Payment Failures
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            If your payment fails after order initiation, the order will not be confirmed
            and no amount will be charged. If you believe your payment was debited without
            order confirmation, please contact us within <strong className="text-cream">24 hours</strong> with
            payment proof and we will investigate.
          </p>
        </section>

        {/* Contact */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            5. Contact
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            For any queries related to this policy, reach us at{" "}
            <a
              href={`mailto:${siteConfig.businessEmail}`}
              className="text-cream underline underline-offset-2 transition-colors hover:text-ember"
            >
              {siteConfig.businessEmail}
            </a>{" "}
            or call{" "}
            <a
              href={`tel:${siteConfig.businessPhone.replace(/\s/g, "")}`}
              className="text-cream underline underline-offset-2 transition-colors hover:text-ember"
            >
              {siteConfig.businessPhone}
            </a>
            .
          </p>
        </section>
      </div>

      {/* Back */}
      <div className="mt-16 border-t border-line/60 pt-8 flex gap-6">
        <a
          href="/refund-policy"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          ← Refund Policy
        </a>
        <a
          href="/privacy-policy"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          Privacy Policy →
        </a>
      </div>
    </div>
  );
}
