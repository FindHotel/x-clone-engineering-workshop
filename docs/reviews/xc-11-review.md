# XC-11 review: Retweet and undo a retweet

**Base commit reviewed:** 04362c3 (change set 04362c3..f12861e)
**Reviewer:** fresh-eyes subagent (`.claude/skills/review-pr/reviewers/code-reviewer.md`)

**Verdict: APPROVE**

## Blocking

None.

## Non-blocking

- `src/frontend/src/hooks/use-tweet-toggle.ts:43-46`: when a later tap is still on its way,
  `isMutating > 1` skips the server count. If that later tap then fails, the rollback goes to the
  optimistic count, not the server's. This edge case already existed in the like hook, and no AC
  test reaches it. Worth knowing, not worth fixing in this story.
- `src/frontend/e2e/xc-11.spec.ts:184`: a line longer than the rest of the spec's formatting.
  Wrap it to match.
- `src/frontend/src/components/tweet-card.tsx:48`: the retweet button now sits before the like
  button (X order). Both specs find buttons by accessible name, so XC-10 is unaffected.

## Criteria → tests

- AC1 → "AC1: tapping retweet once retweets the tweet; tapping again undoes it": ok
- AC2 → "AC2: the retweet count and button update immediately, even on a slow connection": ok
- AC3 → "AC3: if saving my retweet fails, the count goes back and I see a message": ok (covers
  a failed retweet and a failed undo)

## Other checks

Nothing out of scope (no quote tweets). It uses only the existing retweet POST/DELETE (NF5) and
renders only under `_app` (NF4). It reuses `Button`, keeps `setTweetRetweeted` in `src/queries/`
with `credentials: "include"` and a relative path, and edits no generated files. The refactor
into `use-tweet-toggle.ts` keeps the like hook's behaviour and messages exactly. No secrets, no
debug leftovers, no tests skipped or weakened.
