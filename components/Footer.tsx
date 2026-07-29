import Link from "next/link";
import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-carbon text-cream">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="font-display text-2xl">{siteConfig.name}</p>
            <p className="mt-3 max-w-xs font-body text-sm text-ash">
              {siteConfig.tagline}
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest2 text-ember transition-opacity hover:opacity-75"
            >
              Shop the collection →
            </Link>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
              Stay in the loop
            </p>
            <form className="mt-4 flex border-b border-line pb-2 transition-colors focus-within:border-ember/70">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent font-body text-sm text-cream placeholder:text-ash/50 focus:outline-none"
              />
              <button
                type="submit"
                className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-ember"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-line/60 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-ash/60">
            © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.season}
          </p>
          <Link
            href="/admin"
            className="font-mono text-[11px] uppercase tracking-widest2 text-ash/60 transition-colors hover:text-cream"
          >
            Manage catalog
          </Link>
        </div>
      </div>
    </footer>
  );
}
