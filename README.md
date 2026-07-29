# FIELD. — menswear store starter

A storefront where the product catalog lives in a Google Sheet (edit the
sheet, the site updates — or use the admin form, either writes the same
place), with admin auth, input validation, security headers, and a
Razorpay checkout wired up so payments can't be tampered with.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` — see below for the Google Sheets values, and the
previous section of this file (or `.env.example`) for `SESSION_SECRET`,
`ADMIN_PASSWORD_HASH`, and the Razorpay keys.

```bash
npm run dev
```

- Storefront: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Google Sheets setup

**1. Create the sheet.** Make a new Google Sheet with two tabs, named
exactly `Products` and `Orders`. Give each a header row:

- `Products` row 1: `Name | Price | Sizes | Colors | Description | Image URLs`
- `Orders` row 1, 17 columns A–Q:
  `Order ID | Date | Status | Customer Name | Phone | Email | Address | City | Pincode | Items | Amount | Currency | Razorpay Order ID | Payment ID | Shipped | Shipped At | Items JSON`

The app writes and updates the `Orders` tab itself — you never have to fill
it in. `Items` (column J) is the readable summary for whoever packs the
parcel; `Items JSON` (column Q) is the same list in machine-readable form,
so leave it alone. Everything else is safe to edit by hand if you need to
correct an address.

For `Products`, `Sizes`, `Colors`, and `Image URLs` are comma-separated
within their cell (e.g. `S, M, L, XL`). There's no "date added" column on
purpose — the app treats whatever row is lowest on the sheet as the
newest, so a new row (from the admin form or typed in by hand) always
becomes the newest product with no extra bookkeeping.

The 8 products from the original build are in `products-seed.tsv` in this
project — open it, copy everything below the header row, and paste it
starting at `Products!A2` to get the site working immediately.

**2. Create a Google Cloud service account** (this is what lets the app
read and write the sheet on your behalf, without your personal Google
login):

1. Go to [console.cloud.google.com](https://console.cloud.google.com),
   create a project (or use an existing one).
2. Enable the **Google Sheets API** for that project (search for it under
   "APIs & Services" → "Library").
3. Go to "APIs & Services" → "Credentials" → "Create Credentials" →
   "Service Account". Name it anything (e.g. `field-store`).
4. Open the new service account → "Keys" → "Add Key" → "Create new key" →
   JSON. This downloads a `.json` file — keep it somewhere safe, it's a
   real credential.

**3. Share the sheet with the service account.** Open the downloaded JSON
file and copy the `client_email` value (looks like
`field-store@your-project.iam.gserviceaccount.com`). In your Google Sheet,
click **Share** and add that email as an **Editor**. Skip this and every
read/write will fail with a permissions error.

**4. Set the env vars:**

```bash
node -e "console.log(Buffer.from(require('fs').readFileSync('/path/to/downloaded-key.json')).toString('base64'))"
```

Put that output in `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`. It has to be
base64 — Next's env loader treats `$` in `.env` values as shell-style
variable references, so `google` credentials or a bcrypt hash with a raw
`$` in them get silently corrupted otherwise (the exact same issue as the
admin password hash, below).

Then grab the ID from your sheet's URL —
`https://docs.google.com/spreadsheets/d/THIS_PART/edit` — and put it in
`GOOGLE_SHEET_ID`.

### Adding product images without a website to host them on

The Image URLs column needs real URLs, not files pasted directly into the
sheet (Sheets doesn't expose cell-embedded images through its API in any
practical way). Two options:

- **Google Drive** (fastest to start): upload the photo, right-click →
  "Get link" → make sure it's set to "Anyone with the link," then convert
  the share link to a direct-image link:
  `https://drive.google.com/file/d/FILE_ID/view` → `https://drive.google.com/uc?export=view&id=FILE_ID`.
  This works today (`next.config.mjs` already allows these hosts) but
  Google can throttle or change how these links behave without notice —
  treat it as a way to get started, not a permanent CDN.
- **A real image host** (better long-term): Cloudinary, ImageKit, or
  Supabase Storage all have generous free tiers and stable URLs. Add
  whichever host you pick to `remotePatterns` in `next.config.mjs`.

## What's actually protecting the payment flow

The part that matters most for "can this be hacked or bypassed":

1. **The browser never sends a price.** `/checkout` sends product slugs and
   quantities only. `app/api/checkout/create-order/route.ts` looks up the
   real price from the Products sheet for every line item and computes the
   total itself. Editing the request in dev tools to change quantity
   doesn't change what the server charges.
2. **A Razorpay order is created for that server-computed amount**, and
   only the resulting `order_id` (not a price) is handed to the browser to
   open the Razorpay Checkout widget with.
3. **No order is marked paid without a verified signature.**
   `/api/checkout/verify` recomputes the HMAC signature from your
   `RAZORPAY_KEY_SECRET` and compares it to what Razorpay returned.
   Posting a fake "success" straight to that endpoint without a valid
   signature does nothing.
4. **The webhook (`/api/webhooks/razorpay`) is the real source of truth.**
   It verifies Razorpay's own signature header on the raw request body and
   marks the order paid independently of whatever the customer's browser
   did. If their tab closes right after paying, the order still gets
   marked paid.
5. Both the verify route and the webhook call the same idempotent
   `markOrderPaid` — whichever arrives first "wins," the second is a
   harmless no-op. No double-fulfillment from retries or races.
6. **The Orders sheet is where orders live.** A row is appended the moment
   checkout starts (status `created`), and the same row is updated in place
   to `paid` once a signature checks out — never a second row for the same
   order. If the sheet write fails while creating the order, checkout is
   refused before the payment dialog opens, so there is never a charge for
   an order that wasn't recorded.

## Other hardening in this build

- **`/admin` requires login.** `middleware.ts` blocks every `/admin/*`
  page, `POST /api/products`, and *all* of `/api/orders/*` unless a valid
  signed session cookie is present. The orders routes are never public —
  they return customer names, phone numbers and addresses. The cookie is `httpOnly`, so it can't be read by injected JS,
  and rate-limited login attempts slow down password guessing.
- **Every API route validates its input with `zod`** (`lib/validation.ts`)
  — malformed, oversized, or wrong-typed data is rejected with a 400
  instead of reaching your data layer.
- **Rate limiting** on login and checkout endpoints (`lib/rate-limit.ts`).
  It's in-memory, so it only works for a single server instance — see the
  limitations below.
- **Security headers** (`next.config.mjs`): a Content-Security-Policy
  scoped to your own domain plus Razorpay's checkout domains and Google
  Drive's image hosts, plus `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and HSTS.
- **Origin checks** on state-changing POST requests as defense-in-depth
  alongside `sameSite` cookies.

## Known limitations — read before going live with real payments

- **Orders are stored in the Google Sheet**, which survives redeploys and
  is editable by hand — but it isn't a transactional database. Marking an
  order paid or shipped is a read-then-write, so two writes to the *same*
  order within the same second could overwrite each other. In practice one
  webhook and one human touch an order seconds apart, so this is fine at
  shop scale; at high volume, move `lib/orders.ts` to a real database and
  keep the same exported function names so nothing else changes.
- **`data/orders.json` is no longer used.** It's left in place only so an
  old deployment doesn't break; orders come from the sheet now.
- **Product reads are cached for 60 seconds.** A row you add through the
  admin form shows up immediately (it clears the cache); a row you type
  directly into the sheet can take up to a minute to appear on the site.
  If the Sheet is briefly unreachable, the site falls back to the last
  successful read instead of erroring out.
- **Rate limiting is per-instance memory.** Fine on a single VPS/Render
  service; if you ever scale to multiple instances, move this to
  Upstash Redis or similar.
- **Admin auth is a single shared password**, not per-user accounts or
  roles. Fine for one owner; if more people need catalog access, this is
  the first thing to upgrade.
- **No inventory/stock tracking.** Nothing currently stops overselling a
  limited quantity.
- Razorpay is India-first; confirm with them that your business's region
  and the currency in `lib/config.ts` (`siteConfig.currency`) are
  supported on your account before going live.

## Project structure

```
app/
  page.tsx                       → homepage, newest product first
  shop/page.tsx                  → full catalog, no filters
  product/[slug]/page.tsx        → auto-generated product page
  cart/page.tsx                  → cart (localStorage-backed)
  checkout/page.tsx              → Razorpay Checkout flow
  order/[id]/confirmation/       → post-payment confirmation
  admin/page.tsx                 → add-product form (requires login)
  admin/orders/page.tsx          → order list: customer details, ship + WhatsApp
  admin/login/page.tsx           → admin login
  api/products/route.ts          → GET (public) / POST (admin-only, validated)
  api/orders/route.ts            → GET order list (admin-only)
  api/orders/[id]/ship/          → POST shipped toggle (admin-only)
  api/auth/login|logout/         → session cookie issue/clear
  api/checkout/create-order/     → server-priced Razorpay order creation
  api/checkout/verify/           → signature-verified payment confirmation
  api/webhooks/razorpay/         → webhook, source of truth for payment status
lib/
  products.ts                    → reads/writes the Products sheet
  orders.ts                      → reads/writes the Orders sheet
  whatsapp.ts                    → pre-typed shipping message + wa.me link
  google-sheets.ts               → Sheets API auth + read/append/update helpers
  session.ts                     → signed session cookie helpers
  razorpay.ts                    → Razorpay client + signature verification
  validation.ts                  → zod schemas for every API route
  rate-limit.ts, origin-check.ts → basic abuse protection
  config.ts                      → brand name, tagline, currency
components/OrderCard.tsx         → one admin order: ship toggle + WhatsApp
contexts/CartContext.tsx         → client-side cart (localStorage)
data/orders.json                 → unused, kept for backwards compatibility
products-seed.tsv                → paste into the Products sheet to start
```

## Telling a customer their order shipped

1. Open `/admin/orders`. Paid orders that haven't gone out yet are counted
   at the top ("3 to ship").
2. Hand the parcel to the courier, then hit **Mark shipped** — that writes
   `yes` into the `Shipped` column of that order's row.
3. Hit **Send WhatsApp**. Your WhatsApp opens with the message already
   typed out to the customer's number: their name, order number, the items,
   the total, and the delivery address. Read it, press send.

This is a plain [click-to-chat](https://faq.whatsapp.com/5913398998672934)
link — no WhatsApp Business API, no Meta template approval, and it works
from whichever WhatsApp account is signed in on that device.

**Editing the message.** To change it for every order, edit
`shippedMessage()` in `lib/whatsapp.ts`. To tweak it for one order only,
hit **Edit message** on that order's card before sending.

**Phone numbers.** wa.me needs a full international number. If a customer
types a plain 10-digit local number, the app prepends
`siteConfig.defaultCountryCode` from `lib/config.ts` — currently `91`
(India). Change it if you ship somewhere else: `971` UAE, `44` UK, `1`
US/Canada.

## Rebranding

Change the name, tagline, and currency in one place: `lib/config.ts`.
