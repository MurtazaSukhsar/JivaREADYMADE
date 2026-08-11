import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `Privacy Policy for ${siteConfig.legalName}. Learn how we collect, use, and protect your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      {/* Page heading */}
      <div className="mb-14 border-b border-line/60 pb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 font-mono text-[11px] text-ash/50">
          Effective date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex flex-col gap-10">

        {/* Introduction */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            1. Introduction
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            {siteConfig.legalName} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates this website and is
            committed to protecting your personal information. This Privacy Policy explains
            what data we collect when you visit our store, how we use it, and the choices
            you have.
          </p>
        </section>

        {/* Data We Collect */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            2. Information We Collect
          </p>
          <p className="font-body text-sm leading-relaxed text-ash mb-4">
            We collect the following information when you place an order or interact with our site:
          </p>
          <div className="divide-y divide-line/40 rounded-sm border border-line/60 bg-slate/20">
            {[
              { label: "Contact Info", value: "Name, email address, phone number" },
              { label: "Shipping Info", value: "Delivery address, city, state, PIN code" },
              { label: "Payment Info", value: "We do not store card or UPI details — payments are processed by secure third-party gateways (Cashfree / UPI)" },
              { label: "Order Info", value: "Items purchased, quantities, order value, order status" },
              { label: "Technical Info", value: "IP address, browser type, pages visited (via cookies/analytics)" },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash/50">{label}</p>
                <p className="mt-1 font-body text-sm text-cream">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How We Use */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            3. How We Use Your Information
          </p>
          <ul className="flex flex-col gap-2 pl-4">
            {[
              "Process and fulfil your orders",
              "Send order confirmations and shipping updates",
              "Handle customer support queries",
              "Improve our website and shopping experience",
              "Comply with legal and tax obligations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-ash">
                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-ember" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-body text-sm leading-relaxed text-ash">
            We do <strong className="text-cream">not</strong> sell, rent, or share your personal
            data with third parties for marketing purposes.
          </p>
        </section>

        {/* Data Sharing */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            4. Data Sharing
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            We share your data only with service providers essential to operating our store:
          </p>
          <ul className="mt-4 flex flex-col gap-2 pl-4">
            {[
              "Payment gateways (Cashfree, UPI) — for transaction processing",
              "Courier and logistics partners — for order delivery",
              "Cloud infrastructure providers — for hosting and data storage",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-ash">
                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-ember" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-body text-sm leading-relaxed text-ash">
            All third-party partners are contractually obligated to handle your data securely
            and only for the purposes described above.
          </p>
        </section>

        {/* Cookies */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            5. Cookies
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            We use cookies to maintain your shopping cart session and remember your
            language preference. We may also use analytics cookies (e.g., Google Analytics)
            to understand how visitors use our site. You can disable cookies in your browser
            settings; however, some features of the site may not function correctly without them.
          </p>
        </section>

        {/* Data Retention */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            6. Data Retention
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            We retain your personal data for as long as necessary to fulfil orders, resolve
            disputes, and comply with legal obligations. Order records are generally retained
            for a minimum of 7 years as required under applicable Indian tax law.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            7. Your Rights
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            You may contact us to request access to, correction of, or deletion of your
            personal data, subject to our legal retention obligations. We will respond to
            all valid requests within 30 days.
          </p>
        </section>

        {/* Security */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            8. Security
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            We implement industry-standard security measures including HTTPS encryption,
            secure server infrastructure, and restricted access controls. However, no
            transmission over the internet is 100% secure, and we cannot guarantee absolute
            security of your data.
          </p>
        </section>

        {/* Changes */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            9. Changes to This Policy
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            We may update this Privacy Policy periodically. The effective date at the top
            of this page will reflect the latest revision. Continued use of our site after
            changes constitutes acceptance of the revised policy.
          </p>
        </section>

        {/* Contact */}
        <section>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest2 text-ash/60">
            10. Contact
          </p>
          <p className="font-body text-sm leading-relaxed text-ash">
            For any privacy-related concerns, contact us at{" "}
            <a
              href={`mailto:${siteConfig.businessEmail}`}
              className="text-cream underline underline-offset-2 transition-colors hover:text-ember"
            >
              {siteConfig.businessEmail}
            </a>
            .
          </p>
          <div className="mt-4 rounded-sm border border-line/60 bg-slate/20 px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ash/50">Registered Address</p>
            <p className="mt-1 font-body text-sm text-cream">{siteConfig.businessAddress}</p>
          </div>
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
          href="/refund-policy"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
        >
          Refund Policy →
        </a>
      </div>
    </div>
  );
}
