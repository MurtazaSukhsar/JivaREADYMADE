/** @type {import('next').NextConfig} */

// Every host the payment SDK touches has to be named here or the browser
// silently blocks it and checkout dies with a console error most customers
// will never report. Cashfree loads its script from sdk.cashfree.com, talks
// to api/sandbox.cashfree.com, and renders the checkout modal in an iframe
// from payments.cashfree.com — hence the same domains repeated across
// script-src, connect-src and frame-src.
const cashfree = [
  "https://sdk.cashfree.com",
  "https://api.cashfree.com",
  "https://sandbox.cashfree.com",
  "https://payments.cashfree.com",
  "https://payments-test.cashfree.com",
].join(" ");

const csp = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline' for a couple of small inline bootstrap
  // scripts; the payment SDKs are explicitly allow-listed.
  `script-src 'self' 'unsafe-inline' ${cashfree} https://checkout.razorpay.com${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://picsum.photos https://drive.google.com https://lh3.googleusercontent.com https://res.cloudinary.com data:",
  "font-src 'self' data:",
  `connect-src 'self' ${cashfree} https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com`,
  // Banks and card issuers redirect into their own 3-D Secure pages inside
  // the modal, and there is no way to know every one of their domains in
  // advance — so this stays open rather than breaking a payment method the
  // day a bank changes hosts.
  `frame-src 'self' ${cashfree} https: https://api.razorpay.com https://checkout.razorpay.com`,
  "object-src 'none'",
  "base-uri 'self'",
  // Cashfree's in-page modal (not a cross-origin iframe) submits a form
  // directly to their API to load the checkout session — that submission
  // runs in OUR document, so it's bound by our form-action, not theirs.
  // Without api/sandbox.cashfree.com listed here, the browser silently
  // blocks the submission and the modal never shows anything.
  `form-action 'self' ${cashfree}`,
  "frame-ancestors 'self'",
].join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Add your real image host here (Cloudinary, Supabase storage, etc.)
      // if you move off Google Drive links later — see the README note on
      // why Drive is a fine start but not ideal long-term.
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Only takes effect once served over HTTPS, which any real host
          // (Render, Vercel, etc.) does automatically.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
