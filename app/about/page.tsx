import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `About Us — ${siteConfig.name}`,
  description: `Learn about ${siteConfig.legalName} — who we are, what we make, and why we make it.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      {/* Page heading */}
      <div className="mb-14 border-b border-line/60 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          Our story
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">
          About Us
        </h1>
      </div>

      {/* Legal name badge — required for Cashfree */}
      <div className="mb-10 inline-flex items-center gap-3 rounded-sm border border-ember/30 bg-ember/10 px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ash/70">
          Legal Business Name
        </span>
        <span className="font-display text-lg text-cream">{siteConfig.legalName}</span>
      </div>

      {/* Body copy */}
      <div className="space-y-6 font-body text-base leading-relaxed text-ash">
        <p>
          <strong className="text-cream">{siteConfig.legalName}</strong> is a
          menswear label built around one simple idea: clothing that moves the
          way you do. We design and source ready-made garments for real life —
          not the runway, not the rack.
        </p>
        <p>
          Every piece in our catalog is chosen for fit, fabric, and longevity.
          We believe men deserve clothes that look considered without demanding
          effort, and that quality should be accessible — not aspirational.
        </p>
        <p>
          Our range spans everyday kurtas, structured shirts, and relaxed
          trousers — all in fabrics that breathe, drape well, and survive the
          washing machine. Because that&apos;s what a wardrobe actually needs.
        </p>
        <p>
          We ship across India and are constantly adding new styles. If you have
          a question about sizing, fabric, or anything else, reach us through
          our{" "}
          <a href="/contact" className="text-cream underline underline-offset-2 transition-colors hover:text-ember">
            Contact page
          </a>
          .
        </p>
      </div>

      {/* Values grid */}
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            title: "Crafted to last",
            body: "We source fabrics that hold their shape and colour wash after wash.",
          },
          {
            title: "Honest pricing",
            body: "No artificial markups. Every price reflects the true cost of quality.",
          },
          {
            title: "Shipped fast",
            body: "Orders dispatched within 1–2 business days, delivered in 3–5.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-sm border border-line/60 bg-slate/30 p-6"
          >
            <p className="font-display text-lg text-cream">{card.title}</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-ash">
              {card.body}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <a
          href="/shop"
          className="inline-block rounded-sm bg-ember px-6 py-3 font-mono text-[11px] uppercase tracking-widest2 text-carbon transition-opacity hover:opacity-80"
        >
          Shop the collection
        </a>
        <a
          href="/contact"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          Get in touch →
        </a>
      </div>
    </div>
  );
}
