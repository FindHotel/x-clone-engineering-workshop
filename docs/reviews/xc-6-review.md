# XC-6 review: Sign in

- **Base commit reviewed:** 1b55b84 (change set `1b55b84..eb6ce8d`: `eb6ce8d XC-6: Sign in`; `docs/tracker/board-data.js` left out)
- **Verdict:** Approve. No blocking findings.

The change set adds tests only: `src/frontend/e2e/xc-6.spec.ts` (AC1–AC3, each in a signed-out context with a fresh account created via the API) and `src/frontend/src/lib/auth-errors.test.ts`. The sign-in screen already existed (`routes/_auth/sign-in.tsx`, `hooks/use-auth-submit.ts`, `lib/auth-errors.ts`). It reuses the `components/ui/` Form, Input and Button primitives, calls `signIn.email` from the auth client, shows mapped errors in `role="alert"`, and invalidates the session before navigating to `/`. No new backend work (NF5), no hard-coded API origin, no generated files edited, no secrets or debug leftovers. The spec never clicks Sign out, and no earlier spec is touched.

## Findings (by severity)

### Blocking
- None.

### Non-blocking
1. `src/frontend/e2e/xc-6.spec.ts:24`: each run creates three throwaway `xc6-…@example.com` accounts on the shared API, matching XC-5's approach. If the room's user list starts to matter, consider reusing one fixture account per run.
2. `src/frontend/e2e/xc-6.spec.ts:98,109`: the exact-text check on "Incorrect email or password." couples the spec to the copy in `src/frontend/src/lib/auth-errors.ts:4`. That's fine as a regression guard.
3. `src/frontend/src/lib/auth-errors.ts:13`: for codes it doesn't recognise, the UI shows the server's raw message (for example a rate-limit message). This is outside XC-6's criteria.

## Acceptance criteria → tests
- AC1 → ok · AC2 → ok · AC3 → ok (covers both a wrong password and an email with no account; checks the message, staying on `/sign-in`, no Sign out button, and that `/` redirects to sign-in)
