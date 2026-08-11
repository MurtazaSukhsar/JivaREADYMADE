"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabs = [
  { href: "/admin", label: "Add product" },
  { href: "/admin/products", label: "Manage products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const tabClass = (active: boolean) =>
    `rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-widest2 transition-colors ${
      active ? "bg-ember/15 text-ember" : "text-ash hover:bg-slate hover:text-cream"
    }`;

  return (
    <div className="border-b border-line/60 pb-4">
      {/* Tablet and up: the three tabs fit on one line, so no hamburger needed. */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} className={tabClass(pathname === tab.href)}>
              {tab.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-ember"
        >
          Log out
        </button>
      </div>

      {/* Phones: the three tab labels plus "Log out" don't fit on one line
          without wrapping into a jumble, so they collapse behind a hamburger
          instead — same pattern as the storefront header. */}
      <div className="flex items-center justify-between sm:hidden">
        <span className="font-mono text-xs uppercase tracking-widest2 text-cream">
          {tabs.find((tab) => tab.href === pathname)?.label ?? "Admin"}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Toggle admin menu"
          className="flex flex-col gap-1.5 p-1"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-px w-6 bg-cream transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span className={`h-px w-6 bg-cream transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-px w-6 bg-cream transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className="mt-3 flex flex-col gap-1 border-t border-line/50 pt-3 sm:hidden">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setOpen(false)}
              className={tabClass(pathname === tab.href)}
            >
              {tab.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-1 border-t border-line/50 px-3 pt-3 text-left font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-ember"
          >
            Log out
          </button>
        </nav>
      )}
    </div>
  );
}
