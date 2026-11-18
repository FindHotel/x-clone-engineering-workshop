// Where to send someone after they sign in: the in-app page they asked for while signed out
// (XC-7). The value arrives in the URL, so anyone can craft it. Only a same-origin path is kept,
// never an absolute or protocol-relative URL, which would turn sign-in into an open redirect.
export function safeRedirectPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return undefined
  }
  // Leaving the app's origin through tricks such as "/\t/evil.example" is caught by resolving it.
  const base = "http://app.invalid"
  const url = new URL(value, base)
  if (url.origin !== base) return undefined
  const path = url.pathname + url.search + url.hash
  // The sign-in and sign-up screens are never a destination: that would loop.
  if (url.pathname === "/sign-in" || url.pathname === "/sign-up") return undefined
  return path
}
