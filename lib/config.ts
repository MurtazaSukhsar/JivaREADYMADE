// Change these to rebrand the whole site — nothing else needs editing.
export const siteConfig = {
  name: "JIVAREADYYMADE",
  // Used for the browser tab title and social previews. The tagline shown
  // ON the page (hero + footer) is translated, so change it in lib/i18n.ts
  // under "home.heroTitle" / "footer.tagline" as well.
  tagline: "Menswear built for how you actually move.",
  currency: "INR",
  season: "Summer '26",
  nav: [{ label: "Shop", href: "/shop" }],

  // Dialling code assumed when a customer types a plain local number at
  // checkout (no leading "+"). Change this to match where you ship:
  // 91 India · 971 UAE · 44 UK · 1 US/Canada
  defaultCountryCode: "91",

  // ── Business / Cashfree verification details ────────────────────────────
  // Legal business name exactly as registered with Cashfree.
  legalName: "Jivareadymade",
  // Fill in your actual contact details below:
  businessEmail: "Jivareadymade@gmail.com",
  businessPhone: "+91 9724741872",
  businessAddress: "Jiva Readymade, Nana Sutharwada, Dr. Polan School Road, Lunawada, Mahisagar, Gujarat – 389230",
  workingHours: "Mon – Sat, 10 AM – 7 PM IST",

  // Footer quick-links (shown in addition to the main nav).
  footerLinks: [
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
};
