import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Refund Policy — ${siteConfig.name}`,
  description: `Refund policy for ${siteConfig.legalName}. All sales are final. No refunds are issued under any circumstances.`,
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      {/* Page heading */}
      <div className="mb-14 border-b border-line/60 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">
          Refund Policy
        </h1>
        <p className="mt-4 font-mono text-[11px] text-ash/50">
          Effective date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex flex-col gap-10">

        {/* No Refund */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            1. All Sales Are Final
          </p>
          <div className="rounded-sm border border-line/60 bg-slate/20 px-6 py-5">
            <p className="font-body text-sm leading-relaxed text-cream font-semibold">
              No refunds are issued under any circumstances.
            </p>
            <p className="mt-3 font-body text-sm leading-relaxed text-ash">
              Once an order is placed and payment is confirmed, the transaction is
              considered final. {siteConfig.legalName} does not offer monetary refunds,
              credit notes, or store credits for any reason, including but not limited to:
            </p>
            <ul className="mt-4 flex flex-col gap-2 pl-4">
              {[
                "Change of mind after purchase",
                "Incorrect size or fit selected by the customer",
                "Delay in delivery due to courier or logistics partners",
                "Items purchased during sale or promotional events",
                "Partial or complete order dissatisfaction",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 font-body text-sm text-ash">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-ember" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Damaged / Wrong Items */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            2. Damaged or Incorrect Items
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            If you receive an item that is damaged in transit or materially different from what
            you ordered, please contact us within <strong className="text-cream">48 hours</strong> of
            delivery with clear photographs. We will review each case individually. This does
            not constitute a general right to a refund and remains entirely at the discretion
            of {siteConfig.legalName}.
          </p>
        </section>

        {/* No Returns */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            3. No Returns
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            We do not accept returns or exchanges. Products once sold cannot be sent back
            to our facility. Please review size guides carefully before completing your purchase.
          </p>
        </section>

        {/* Chargebacks */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            4. Payment Disputes & Chargebacks
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            Initiating an unjustified chargeback or dispute with your bank or payment provider
            after receiving your order is a violation of these terms. {siteConfig.legalName} reserves
            the right to pursue such cases through appropriate legal channels.
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
          href="/shop"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          ← Back to shop
        </a>
        <a
          href="/cancellation-policy"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          Cancellation Policy →
        </a>
      </div>
    </div>
  );
}
