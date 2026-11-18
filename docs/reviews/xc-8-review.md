# XC-8 review: Scroll the home timeline

- **Base commit reviewed:** f96528e (change set `f96528e..bf40142`: `f41ccfe` is the story; `bf40142` only changes `docs/tracker/board-data.js`, which was left out of the review)
- **Verdict:** Approve. No blocking findings.

The home page becomes an infinitely scrolling timeline: `src/queries/timeline.ts` (an `infiniteQueryOptions` on `GET /api/timeline` with `credentials: "include"`), `hooks/use-load-more-on-scroll.ts` (an IntersectionObserver sentinel), `components/tweet-card.tsx` and `lib/user.ts`'s `formatHandle`, each with Vitest tests. It reuses the `Button` primitive and hard-codes no API origin. The page stays under `_app/`, behind sign-in (NF4). There's no new backend work (NF5). The layout truncates long names and handles at phone widths (NF2) and uses theme tokens for light and dark (NF3). `tsc -b`, `lint` and Vitest (15/15) are clean.

## Findings (by severity)

### Blocking
- None. The reviewer made this conditional on the product owner's AC1 decision being on the board. It is: the PO commented "Go with Option #1" on XC-8 on 2026-11-18 at 12:15, which accepts `/api/timeline`'s semantics (own tweets plus followed accounts).

### Non-blocking
1. `src/frontend/e2e/xc-8.spec.ts:7`, `src/frontend/src/queries/timeline.ts:27`: AC1 and R4 still say "all users / everyone", while the build follows the PO's option 1 (own + followed). The AC1 test never checks a tweet from an account the reader doesn't follow. AC4's empty state relies on the per-person timeline. The story text should be reworded by the PO to match.
2. `src/frontend/e2e/xc-8.spec.ts:32`: each run signs up 5 throwaway accounts and posts about 30 tweets on the shared API (25 for AC2). The person's saved sign-in is untouched. Worth knowing; no change required.
3. `src/frontend/e2e/xc-8.spec.ts:15`: `BASE_URL` repeats `baseURL` from `playwright.config.ts`. Reading it from one place would keep them from drifting apart.
4. `src/frontend/e2e/xc-8.spec.ts:120`: `toHaveCount(20)` before scrolling depends on the sentinel staying outside the 400px `rootMargin` (`use-load-more-on-scroll.ts:26`) at 1280x720. Shorter tweets or a taller viewport could load page 2 early and make this flaky.
5. `src/frontend/e2e/xc-8.spec.ts:159`: the time regex `/^\d+[smhd]$|[A-Za-z]/` accepts any text with a letter in it. `/^\d+[sm]$/` would actually check the relative time of a just-posted tweet. The `datetime` check on line 158 covers the underlying value.

## Acceptance criteria → tests
- AC1 → "AC1: the home timeline shows tweets from all users, newest first": ok under the PO's option 1 (own + followed, interleaved newest first). It would be weak under the story's literal "everyone".
- AC2 → "AC2: more tweets load automatically as I scroll, with no next-page button": ok (a first page of 20, no next/more button or link, all 25 after scrolling with the oldest last)
- AC3 → "AC3: each tweet shows the author's name and handle, the time, the text and any image": ok (name, @handle, `<time datetime>`, text, the image's src and that it loaded; no image on a text-only tweet)
- AC4 → "AC4: with no tweets yet I see a simple empty message": ok

## Conventions
The spec imports from `./fixtures`, wraps actions in `evidence.step` and never clicks Sign out. Each test signs its own browser context in as a throwaway account. The API call is in `src/queries/`. `routeTree.gen.ts` isn't edited. No secrets, no debug leftovers, no skipped tests.
