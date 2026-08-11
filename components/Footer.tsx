import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { getT } from "@/lib/i18n-server";

export default function Footer() {
  const t = getT();

  return (
    <footer className="border-t border-line/70 bg-carbon text-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">

        {/* Top row */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-4">

          {/* Brand block */}
          <div className="sm:col-span-1">
            <Link
              href="/"
              className="font-display text-2xl tracking-tight text-cream transition-colors hover:text-ember"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-3 font-body text-sm leading-relaxed text-ash max-w-[22ch]">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest2 text-ash/50">
              Navigation
            </p>
            <ul className="flex flex-col gap-3">
              {siteConfig.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-[11px] uppercase tracking-widest2 text-cream/80 transition-colors hover:text-ember"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest2 text-ash/50">
              Legal
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-[11px] uppercase tracking-widest2 text-cream/80 transition-colors hover:text-ember"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest2 text-ash/50">
              Contact
            </p>
            <ul className="flex flex-col gap-4">
              <li>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash/40 mb-0.5">Email</p>
                <a
                  href={`mailto:${siteConfig.businessEmail}`}
                  className="font-body text-sm text-cream transition-colors hover:text-ember"
                >
                  {siteConfig.businessEmail}
                </a>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash/40 mb-0.5">Phone</p>
                <a
                  href={`tel:${siteConfig.businessPhone.replace(/\s/g, "")}`}
                  className="font-body text-sm text-cream transition-colors hover:text-ember"
                >
                  {siteConfig.businessPhone}
                </a>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash/40 mb-0.5">Address</p>
                <p className="font-body text-sm text-ash leading-relaxed">
                  {siteConfig.businessAddress}
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 w-full border-t border-line/40 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ash/50">
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link
              href="/about"
              className="font-mono text-[10px] uppercase tracking-widest2 text-ash/50 transition-colors hover:text-cream"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="font-mono text-[10px] uppercase tracking-widest2 text-ash/50 transition-colors hover:text-cream"
            >
              Contact Us
            </Link>
            <Link
              href="/privacy-policy"
              className="font-mono text-[10px] uppercase tracking-widest2 text-ash/50 transition-colors hover:text-cream"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund-policy"
              className="font-mono text-[10px] uppercase tracking-widest2 text-ash/50 transition-colors hover:text-cream"
            >
              Refund Policy
            </Link>
            <Link
              href="/cancellation-policy"
              className="font-mono text-[10px] uppercase tracking-widest2 text-ash/50 transition-colors hover:text-cream"
            >
              Cancellation Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
