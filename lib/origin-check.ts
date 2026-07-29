// Defense-in-depth CSRF check for state-changing requests. sameSite=lax
// cookies already block most cross-site POSTs, but browsers vary and this
// costs nothing to also check server-side.
export function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin requests from fetch() often omit Origin
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
