# XC-10 review: Like and unlike a tweet

## Round 2 (after send-back 1)

**Base commit reviewed:** 3ffbdcc (change set 3ffbdcc..947b723)
**Reviewer:** fresh-eyes subagent (`.claude/skills/review-pr/reviewers/code-reviewer.md`)

**Verdict: APPROVE**

### Blocking

None. The round 1 blocker (throwaway accounts with a hard-coded password) is fixed in 947b723:
the spec runs on the saved sign-in. Round 1's missing failed-unlike check is now covered too
(`xc-10.spec.ts:186-199`).

### Non-blocking

- `src/frontend/e2e/xc-10.spec.ts:21-27`: each run posts 3 tweets to the shared timeline and
  never removes them (`afterEach` only unlikes them). Delete them if the API allows it, or keep
  their text clearly marked as a test, as it is now.
- `src/frontend/e2e/xc-10.spec.ts:30-37`: `savedTweet` reads only the first 50 timeline items.
  Heavy posting on the shared API could push the tweet past them. Reading the tweet by id would
  be more robust.
- `src/frontend/src/queries/tweets.ts:1-12`: a plain mutation function, not `queryOptions`. That's
  correct for a write, with nothing to change.
- `src/frontend/src/components/tweet-card.tsx:77`: the comment "Like X, a zero count shows
  nothing" reads ambiguously. "As on X, …" would be clearer.

### Criteria → tests

- AC1 → "AC1: tapping like once likes the tweet; tapping again removes my like": ok
- AC2 → "AC2: the like count and button update immediately, even on a slow connection": ok
- AC3 → "AC3: if saving my like fails, the count goes back and I see a message": ok (covers a
  failed like and a failed unlike)

### Other checks

The app code does what the story asks and nothing out of scope: an optimistic update with the
in-flight fetch cancelled first, a rollback with a toast (the Toaster is mounted in
`__root.tsx`), and handling for a second tap made before the first one finishes. It reuses
`Button` and the existing endpoints (NF5). No NF breaches, no generated files edited, no
hard-coded origin, no debug leftovers, no tests skipped or weakened.

## Round 1

**Base commit reviewed:** 3ffbdcc (change set 3ffbdcc..17f3644)
**Reviewer:** fresh-eyes subagent (`.claude/skills/review-pr/reviewers/code-reviewer.md`)

**Verdict: CHANGES NEEDED**

## Blocking

1. `src/frontend/e2e/accounts.ts:10,29-43,66-71` (used by `e2e/xc-10.spec.ts:22-33`): the spec
   signs up new accounts through `/api/auth/sign-up/email` with a hard-coded password and signs
   the browser in by injecting their session cookies. CLAUDE.md says e2e tests run signed in as the
   person ("never sign in or handle a password yourself"), and the workshop note says to use your
   own account. Every run also adds 6 junk accounts to the shared API, and their follows are never
   undone. **Must change:** run the spec on the saved sign-in (`e2e/.auth/user.json`). In each
   test, that account posts a fresh tweet of its own, likes and unlikes it, and leaves it unliked
   at the end. Remove `signUp`, `signInAs`, `follow` and `PASSWORD`.

## Non-blocking

- `src/frontend/e2e/accounts.ts:11`: `BASE_URL` hard-codes `http://localhost:5173`. Read it from
  the Playwright config's `baseURL` or the request fixture.
- `src/frontend/e2e/accounts.ts:25`: a top-level `test.afterEach` in a shared module may register
  for only one spec per worker. Register cleanup in each spec, or use a fixture.
- `src/frontend/src/queries/tweets.ts:1-12`: `setTweetLiked` is a mutation function, not
  `queryOptions`. That fits a mutation, and it uses `credentials: "include"` and a relative path.
  It's a deliberate deviation, with nothing to change.
- `src/frontend/e2e/xc-10.spec.ts:126-157`: AC3 tests only a failed like. Nothing tests the
  failed-unlike message (`use-like-tweet.ts:47`).

## Criteria → tests

- AC1 → "AC1: tapping like once likes the tweet; tapping again removes my like": ok
- AC2 → "AC2: the like count and button update immediately, even on a slow connection": ok
- AC3 → "AC3: if saving my like fails, the count goes back and I see a message": ok

## Other checks

The app code does what the story asks, with nothing out of scope: an optimistic cache update, a
rollback with a toast, and handling for a second tap made before the first one finishes. It
reuses `Button` and the existing like endpoints (NF5). No NF1/NF2/NF4 breaches, no generated
files edited, no debug leftovers, no tests skipped or weakened.
