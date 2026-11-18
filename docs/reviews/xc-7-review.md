# XC-7 review: Keep the app behind sign-in

## Round 2: return to the requested page (PO send-back)

- **Base commit reviewed:** ccd42a5 (change set `ccd42a5..141bc53`; `docs/tracker/board-data.js` left out)
- **Verdict:** Approve. No blocking findings.

The signed-out redirect in `_app.tsx` now carries `?redirect=<requested href>`, leaving it out for `/`. The sign-in route's `validateSearch` and the `_auth` guard pass the value through `safeRedirectPath` (`lib/redirect.ts`, with unit tests), and `useAuthSubmit` navigates there after signing in. **Open redirect: safe.** Non-strings and values not starting with `/` are rejected, and so are `//` and `/\`, anything that leaves the origin once WHATWG URL resolves it (which catches `/\t/evil`), and `/sign-in` and `/sign-up` (no loop). The hash is kept, because `location.href` includes search and hash. No test was weakened: the two changed assertions (`/\/sign-in$/` replaced by `expectSignInFor`) are stricter. `routeTree.gen.ts` is untouched, there are no new API calls, and NF4 and NF5 hold.

### Blocking
- None.

### Non-blocking
1. `src/frontend/src/routes/_auth/sign-in.tsx:126`: the "Sign up" link drops `?redirect=`, so someone who arrives from a deep link and signs up lands on Home. The PO's send-back only mentions sign-in. Cheap follow-up: pass the search through the link and add the same `validateSearch` to sign-up.
2. `src/frontend/src/routes/_app.tsx`: the param is left out only when `location.href` is exactly `/`. `/?x=1` keeps it, which is harmless. Don't "fix" it to a pathname check.
3. `src/frontend/e2e/xc-7.spec.ts:28`: each run adds a throwaway account on the shared API (the same pattern as XC-5 and XC-6).

### Acceptance criteria → tests
- AC1 → ok (unchanged) · AC2 → ok, stricter (pathname plus exact `redirect` value, including navigation without a reload) · PO send-back → ok (AC2 signs in from `/tweets/123?tab=replies#top` and lands on exactly that page; `redirect.test.ts`)


## Round 1: initial build

- **Base commit reviewed:** eb6ce8d (change set `eb6ce8d..ccd42a5`: `ccd42a5 XC-7: Keep the app behind sign-in`; `docs/tracker/board-data.js` left out)
- **Verdict:** Approve. No blocking findings.

The change adds a catch-all route, `src/frontend/src/routes/_app/$.tsx`, under the signed-in `_app` layout. Unknown paths now go through the existing `_app` `beforeLoad` guard and redirect to `/sign-in` when signed out (R3, NF4). Signed in, they show an in-app "Page not found" page. `routeTree.gen.ts` was regenerated, not hand-edited. The change reuses `components/ui/button`, adds no API calls, hard-codes no origin and needs no backend work (NF5). There are no secrets or debug leftovers, and no earlier spec was changed.

## Findings (by severity)

### Blocking
- None.

### Non-blocking
1. `src/frontend/src/routes/_app/$.tsx:15`: the signed-in "Page not found" page is new UI that no spec covers. Consider a signed-in check in a later story.
2. `src/frontend/src/routes/_app.tsx:18`: the redirect to `/sign-in` drops the requested page, so after signing in the person lands on Home. The story doesn't ask to keep it; this is for the product owner to consider.
3. `src/frontend/e2e/xc-7.spec.ts:7`: signed-out tests use an empty storageState and never click Sign out, as CLAUDE.md requires. Nothing to change.

## Acceptance criteria → tests
- AC1 → ok (both screens render and link to each other; `/`, unknown, nested, query and hash paths show only sign-in; no app content; no `/api/timeline` request)
- AC2 → ok (each path ends on `/sign-in` with the sign-in heading, including navigation without a reload)
