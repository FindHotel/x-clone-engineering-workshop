# XC-12 review: Reply to a tweet inline

**Base commit reviewed:** e888a77 (change set e888a77..ed472aa)
**Reviewer:** fresh-eyes subagent (`.claude/skills/review-pr/reviewers/code-reviewer.md`)

**Verdict: APPROVE**

## Blocking

None.

## Non-blocking

- `src/frontend/src/components/tweet-card.tsx:38`: every card with `replyCount > 0` fetches its
  own replies, so each timeline load makes one extra request per tweet with replies. That's fine
  for the current API, and NF7 (scale) is "Not known yet". If timelines grow, consider fetching
  replies only when the tweet scrolls into view.
- `src/frontend/e2e/xc-12.spec.ts:126-131`: the `posts` check comes straight after the
  Ctrl/Cmd+Enter presses, so a late POST could slip past it. The `savedReplies` API check mostly
  covers this. `expect.poll` or a short wait would make it airtight.
- `src/frontend/e2e/xc-12.spec.ts`: no phone-width step (NF2). The layout is plain flex, so this
  is only a coverage gap.
- `src/frontend/src/components/tweet-replies.tsx:90`: posting a reply isn't optimistic. That's
  acceptable: NF1 names likes, retweets and new posts, not replies.

## Criteria → tests

- AC1 → "AC1: I can write a reply to a tweet from the timeline": ok
- AC2 → "AC2: replies appear directly under that tweet in the timeline, without opening a
  separate page": ok
- AC3 → "AC3: I cannot post an empty reply": ok

## Other checks

The change reuses `Button` and `Textarea`. API calls are in `src/queries/replies.ts`, with
`queryOptions` and `credentials: "include"`, and there's no hard-coded origin. It uses only the
existing endpoints (NF5) and nothing out of scope. No generated files edited, no debug
leftovers, no tests skipped or weakened, no secrets.
