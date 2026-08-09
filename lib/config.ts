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

  // ── UPI (GPay / PhonePe / Paytm) ────────────────────────────────────────
  // The prepaid option at checkout. The site generates a fresh QR per order
  // with the amount already filled in, so the customer never types a figure.
  //
  // `vpa` is your UPI ID — the thing your existing GPay QR already encodes,
  // e.g. "9724741872@ybl" or "jivareadymade@okaxis". Find it in GPay under
  // your profile photo → the ID shown beneath your name.
  //
  // `payeeName` is what the customer sees in their payment app before they
  // confirm. Keep it recognisable or people abandon the payment.
  //
  // Both can be overridden by UPI_ID / UPI_PAYEE_NAME in .env, which is the
  // better place for them if this repo is ever public.
  upi: {
    vpa: "",
    payeeName: "Jiva Readymade",
  },

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
