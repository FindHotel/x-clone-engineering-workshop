# XC-9 review: Post a tweet

- **Base reviewed:** 04e8853 (change set 04e8853..86fe4d9, commit "XC-9: Post a tweet")
- **Reviewer:** fresh-eyes subagent (story, PRD non-functional requirements, CLAUDE.md, diff and commit messages only)

Verdict: APPROVE

Blocking:
- (none)

Non-blocking:
- src/frontend/src/components/tweet-composer.tsx:65 — the image is dropped for any `TweetRejectedError`, including a 400 from `postTweet` (src/frontend/src/queries/tweets.ts:105), where the image was already uploaded and was not the problem. Drop it only when the upload itself was refused, for example with a separate error class or a flag on the error.
- src/frontend/src/queries/tweets.ts:105 — "The tweet couldn't be posted as it is." doesn't tell the person what to fix. If the API's 400 body says why, show that.
- src/frontend/e2e/xc-9.spec.ts:128-166 — AC1 only posts an image together with text. Image-only posting is allowed (tweet-composer.tsx:36) and covered only by the unit test. An e2e step that posts an image with no text would cover that path end to end.
- src/frontend/e2e/xc-9.spec.ts:201-204 — after the reload, the spec expects the test tweet to be the first article. On the shared API another person's newer tweet could take that spot and make the test flaky. Matching the tweet with `filter({ hasText })` is more robust, and the top-of-timeline check before the reload already covers AC2.
- src/frontend/src/components/tweet-composer.test.tsx:31-32 — wrong indentation in `beforeEach`.
- src/frontend/src/components/tweet-card.tsx:9 — the card imports `isPendingTweet` from a mutation hook module. A small helper in `queries/timeline.ts` (or `lib/`) would keep the card from depending on the hook. This is a style point only.

Criteria → tests:
- AC1 → "AC1: I can type a tweet and post it, with or without one image" — ok
- AC2 → "AC2: my new tweet appears at the top of my timeline straight away" — ok
- AC3 → "AC3: I cannot post an empty tweet" — ok
- AC4 → "AC4: a tweet that's too long, or an image that isn't allowed, shows a clear message" — ok

Notes: NF1 is met by the optimistic insert in `use-post-tweet.ts`. NF4 holds because the composer is behind sign-in on `_app/index.tsx`. NF5 holds: only the existing `/api/upload` and `/api/tweets` endpoints are used. API calls are in `src/queries/tweets.ts` with `credentials: "include"` and no hard-coded origin. The change reuses the `Button` and `Textarea` primitives, edits no generated files, and has no skipped tests or debug leftovers.
