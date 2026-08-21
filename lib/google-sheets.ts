import "server-only";
import crypto from "crypto";

// Talks to the Google Sheets API using a service account, without pulling
// in the (large) official `googleapis` package. Node's built-in `crypto`
// can already do the RS256 signing a service-account JWT needs, and the
// Sheets API itself is just plain REST + fetch once you have a token.

type ServiceAccountCredentials = { client_email: string; private_key: string };

function getCredentials(): ServiceAccountCredentials {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!b64) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not set — see .env.example for how to create and encode it."
    );
  }

  let parsed: Partial<ServiceAccountCredentials>;
  try {
    parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 isn't valid base64-encoded JSON.");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("The service account JSON is missing client_email or private_key.");
  }
  return parsed as ServiceAccountCredentials;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.token;

  const { client_email, private_key } = getCredentials();
  const nowSec = Math.floor(now / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: nowSec,
    exp: nowSec + 3600,
  };

  const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${encode(header)}.${encode(claims)}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signingInput)
    .sign(private_key, "base64url");
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google auth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  // Refresh a minute early so we never hand out a token that expires
  // mid-request.
  cachedToken = { token: data.access_token, expiresAt: now + (data.expires_in - 60) * 1000 };
  return cachedToken.token;
}

// UNFORMATTED_VALUE matters here: without it, a Price cell formatted as
// currency comes back as a display string like "AED 289.00" instead of the
// number 289, which would silently break every price parse downstream.
export async function readSheetRows(spreadsheetId: string, range: string): Promise<string[][]> {
  const token = await getAccessToken();
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}` +
    `?valueRenderOption=UNFORMATTED_VALUE`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Sheets read failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? [];
}

// valueInputOption: USER_ENTERED lets Sheets interpret what we write the
// same way a human typing it would (useful for the Products tab). RAW keeps
// values exactly as sent — required for the Orders tab, where a phone like
// "+919876543210" or a pincode with a leading zero must not be reinterpreted
// as a number.
type ValueInputOption = "USER_ENTERED" | "RAW";

export async function appendSheetRow(
  spreadsheetId: string,
  range: string,
  row: (string | number)[],
  valueInputOption: ValueInputOption = "USER_ENTERED"
): Promise<void> {
  const token = await getAccessToken();
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append` +
    `?valueInputOption=${valueInputOption}&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Sheets append failed (${res.status}): ${text}`);
  }
}

// Overwrites one specific row. `range` must pin the exact row, e.g.
// "Orders!A7:Q7". Used to flip an order to paid or shipped in place rather
// than appending a second row for the same order.
export async function updateSheetRow(
  spreadsheetId: string,
  range: string,
  row: (string | number)[],
  valueInputOption: ValueInputOption = "RAW"
): Promise<void> {
  const token = await getAccessToken();
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}` +
    `?valueInputOption=${valueInputOption}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Sheets update failed (${res.status}): ${text}`);
  }
}
