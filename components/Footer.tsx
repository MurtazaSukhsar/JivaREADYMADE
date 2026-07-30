import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { getT } from "@/lib/i18n-server";

export default function Footer() {
  const t = getT();

  return (
    <footer className="border-t border-line/70 bg-carbon text-cream">
      <div className="mx-auto max-w-2xl px-5 py-14 text-center sm:px-8 flex flex-col items-center">
        <p className="font-display text-3xl">{siteConfig.name}</p>
        <p className="mt-4 font-body text-base leading-relaxed text-ash max-w-md">
          {t("footer.tagline")}
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-widest2 text-cream transition-opacity hover:opacity-75"
        >
          {t("footer.shopCollection")}
        </Link>

        <div className="mt-12 w-full border-t border-line/60 pt-6">
          <p className="font-mono text-xs text-cream">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
