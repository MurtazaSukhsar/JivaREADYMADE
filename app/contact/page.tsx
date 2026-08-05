import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Contact Us — ${siteConfig.name}`,
  description: `Get in touch with ${siteConfig.legalName}. Find our email, phone, address, and working hours.`,
};

// ── Contact detail rows ──────────────────────────────────────────────────────
const contactDetails = [
  {
    label: "Legal Business Name",
    value: siteConfig.legalName,
    href: null,
  },
  {
    label: "Email",
    value: siteConfig.businessEmail,
    href: `mailto:${siteConfig.businessEmail}`,
  },
  {
    label: "Phone",
    value: siteConfig.businessPhone,
    href: `tel:${siteConfig.businessPhone.replace(/\s/g, "")}`,
  },
  {
    label: "Address",
    value: siteConfig.businessAddress,
    href: null,
  },
  {
    label: "Working Hours",
    value: siteConfig.workingHours,
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      {/* Page heading */}
      <div className="mb-14 border-b border-line/60 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          Reach out
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">
          Contact Us
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Business details card */}
        <div>
          <p className="mb-6 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            Business Details
          </p>
          <div className="divide-y divide-line/40 rounded-sm border border-line/60 bg-slate/20">
            {contactDetails.map(({ label, value, href }) => (
              <div key={label} className="px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash/50">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="mt-1 block font-body text-sm text-cream transition-colors hover:text-ember"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 font-body text-sm text-cream">{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help text + WhatsApp nudge */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
              How we can help
            </p>
            <p className="font-body text-sm leading-relaxed text-ash">
              Have a question about sizing, fabric, or your order? Drop us a
              message and we&apos;ll get back to you within one business day.
            </p>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
              Order support
            </p>
            <p className="font-body text-sm leading-relaxed text-ash">
              For order-specific queries, please have your order ID ready when
              you contact us — it speeds things up considerably.
            </p>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
              Working hours
            </p>
            <p className="font-body text-sm text-cream">{siteConfig.workingHours}</p>
            <p className="mt-1 font-body text-sm text-ash">
              Replies outside these hours may take until the next business day.
            </p>
          </div>

          {/* Quick-action buttons */}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${siteConfig.businessEmail}`}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-ember px-5 py-3 font-mono text-[11px] uppercase tracking-widest2 text-carbon transition-opacity hover:opacity-80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email us
            </a>
            <a
              href={`tel:${siteConfig.businessPhone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-line/70 px-5 py-3 font-mono text-[11px] uppercase tracking-widest2 text-cream transition-colors hover:border-ember hover:text-ember"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6 6l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call us
            </a>
          </div>
        </div>
      </div>

      {/* Back to shop */}
      <div className="mt-16 border-t border-line/60 pt-8">
        <a
          href="/shop"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          ← Back to the collection
        </a>
      </div>
    </div>
  );
}
