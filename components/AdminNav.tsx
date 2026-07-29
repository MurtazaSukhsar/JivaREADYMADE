"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Add product" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 pb-4">
      <nav className="flex gap-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-widest2 transition-colors ${
                active
                  ? "bg-ember/15 text-ember"
                  : "text-ash hover:bg-slate hover:text-cream"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/admin/login";
        }}
        className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-ember"
      >
        Log out
      </button>
    </div>
  );
}
