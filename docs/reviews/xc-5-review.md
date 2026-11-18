# XC-5 review: Sign up

- **Base commit reviewed:** 7c5b54c (change set `7c5b54c..e9e2cd5`)
- **Verdict:** Approve. No blocking findings.

The change only adds tests: `src/frontend/e2e/xc-5.spec.ts`. The sign-up code it covers was already in the scaffold (`routes/_auth/sign-up.tsx`, `hooks/use-auth-submit.ts`, `lib/auth-errors.ts`) and meets the story. It uses `components/ui/`, needs no new backend work (NF5), hard-codes no API origin, and the page is only open to signed-out visitors (NF4).

## Findings (by severity)

### Blocking
- None.

### Non-blocking
1. `src/frontend/e2e/xc-5.spec.ts:107-109` (AC3, email already used): shows that the second password can't sign in, but not that the original account still works. Add `expect(await canSignIn(request, usedEmail, PASSWORD)).toBe(true)`.
2. `src/frontend/e2e/xc-5.spec.ts:149` (AC3): `canSignIn(request, "not-an-email", PASSWORD)` is always false because the API rejects the format, so it proves nothing. The UI checks before it are the real coverage. Also, the bad-email and short-password steps (lines 117-130) don't check that Sign out is absent. The URL check covers that indirectly.
3. `src/frontend/e2e/xc-5.spec.ts:17-21`: each run creates about 3 throwaway `@example.com` accounts on the shared API. The story makes this unavoidable, but it should be documented.
4. The AC1 and AC2 tests overlap but each checks something different. No change needed.

## Acceptance criteria → tests
- AC1 → "AC1: I can create an account with an email and a password": ok
- AC2 → "AC2: after signing up I am signed in and taken into the app": ok (URL, Sign out shows the account, the session survives a reload)
- AC3 → "AC3: a used email or invalid details show a clear message and create no account": ok (used email, bad email, short password, passwords that don't match)

## Conventions
The spec imports from `./fixtures`, wraps actions in `evidence.step`, runs signed out in an empty storageState, and never clicks Sign out. No secrets, no skipped tests, no generated files edited.
