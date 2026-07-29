/** @type {import('next').NextConfig} */

const csp = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline' for a couple of small inline bootstrap
  // scripts; Razorpay's own checkout.js is explicitly allow-listed.
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://picsum.photos https://drive.google.com https://lh3.googleusercontent.com data:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
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
