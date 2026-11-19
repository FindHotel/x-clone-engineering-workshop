window.BOARD = {
  "project": {
    "key": "XC",
    "name": "X Clone"
  },
  "nextNumber": 15,
  "items": [
    {
      "key": "XC-1",
      "type": "Epic",
      "title": "Accounts and sign-in",
      "description": "Lets people create an account and sign in with an email and password, and keeps the rest of the app behind sign-in. Anyone who is not signed in only sees the sign-in and sign-up screens. This comes first because every other part of the app depends on a signed-in user.\n\nCovers: R1 sign-up, R2 sign-in, R3 sign-in gate, NF4 security of access\n\nSource: docs/epics/x-clone-v3-epics.md#epic-1-accounts-and-sign-in",
      "acceptanceCriteria": [],
      "parent": null,
      "status": "Done",
      "source": "docs/epics/x-clone-v3-epics.md#epic-1-accounts-and-sign-in",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T12:53",
      "updates": 5
    },
    {
      "key": "XC-2",
      "type": "Epic",
      "title": "Home timeline and posting",
      "description": "Delivers the core read-and-write loop: a newest-first timeline that keeps loading as the user scrolls, with each tweet showing author, time, text and optional image. Users can also post a short tweet with one optional image and see it at the top straight away.\n\nCovers: R4 timeline, R5 infinite scroll, R6 tweet display, R7 posting with optional image, R8 new tweet appears at top\n\nSource: docs/epics/x-clone-v3-epics.md#epic-2-home-timeline-and-posting",
      "acceptanceCriteria": [],
      "parent": null,
      "status": "Done",
      "source": "docs/epics/x-clone-v3-epics.md#epic-2-home-timeline-and-posting",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T13:34",
      "updates": 3
    },
    {
      "key": "XC-3",
      "type": "Epic",
      "title": "Likes, retweets and replies",
      "description": "Lets users react to other people's tweets with one-tap like and retweet (and one-tap undo), with counts that update immediately, and reply to a tweet with replies shown right under it in the timeline. Together these make up the \"react to others\" part of the core loop.\n\nCovers: R9 like, R10 retweet, R11 instant counts, R12 inline replies, NF1 responsiveness\n\nSource: docs/epics/x-clone-v3-epics.md#epic-3-likes-retweets-and-replies",
      "acceptanceCriteria": [],
      "parent": null,
      "status": "Done",
      "source": "docs/epics/x-clone-v3-epics.md#epic-3-likes-retweets-and-replies",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T13:39",
      "updates": 5
    },
    {
      "key": "XC-4",
      "type": "Epic",
      "title": "Theming and device support",
      "description": "Makes the app look polished in both light and dark mode and work well on desktop and mobile browsers. It cuts across the other epics, so it is kept separate to make sure it gets its own attention.\n\nCovers: R13 light and dark mode, R14 desktop and mobile browsers, NF2 browser support, NF3 visual quality\n\nSource: docs/epics/x-clone-v3-epics.md#epic-4-theming-and-device-support",
      "acceptanceCriteria": [],
      "parent": null,
      "status": "New",
      "source": "docs/epics/x-clone-v3-epics.md#epic-4-theming-and-device-support",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
    },
    {
      "key": "XC-5",
      "type": "Story",
      "title": "Sign up",
      "description": "As a new visitor, I want to sign up with my email and a password, so that I can start using the app.\n\nSource: docs/stories/x-clone-v3-epic-1-stories.md#story-11-sign-up",
      "acceptanceCriteria": [
        "I can create an account by entering an email and a password.",
        "After signing up, I am signed in and taken into the app.",
        "If the email is already used or the details are invalid, I see a clear message and no account is created."
      ],
      "parent": "XC-1",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-1-stories.md#story-11-sign-up",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T11:58",
      "updates": 12,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T11:41",
          "body": "Started from 7c5b54c."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T11:42",
          "body": "Ready for review (commit on top of base 7c5b54c).\n\nFiles changed:\n- src/frontend/e2e/xc-5.spec.ts (new): AC1, AC2, AC3 tests.\n\nNo app code changed: the sign-up page (routes/_auth/sign-up.tsx, hooks/use-auth-submit.ts, lib/auth-errors.ts) already met all three criteria, so the tests passed on the first run. No new logic, so no new Vitest tests.\n\nChecks:\n- pnpm exec tsc -b: pass\n- pnpm lint: pass\n- pnpm test (Vitest): pass (2/2)\n- pnpm e2e e2e/xc-5.spec.ts: pass (3/3); full e2e suite incl. smoke: pass (4/4)\n\nDecisions / for the reviewer:\n- The spec runs signed out (test.use with empty storageState), so the saved sign-in is never used or signed out.\n- Each run creates throwaway accounts on the shared API (xc5-<label>-<timestamp>@example.com, about 3 per run). Unavoidable for testing sign-up against the real API; there is no delete-account endpoint used.\n- 'No account is created' is proven by trying to sign in with the attempted credentials through the API (expected to fail). For the duplicate email, the original account is created via the API first, then the UI attempt with a different password must not sign in.\n- The duplicate-email assertion checks the app's own wording ('An account with this email already exists. Try signing in instead.') rather than /already exists/, which would also match the raw server message.\n- 'Invalid details' is covered by an invalid email, a too-short password (<8) and mismatched confirmation. The 8-character minimum is the client's rule; the PRD leaves password rules 'Not known yet' (NF4)."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T11:47",
          "body": "Review of 7c5b54c..e9e2cd5: Approve, no blocking findings. Full review in docs/reviews/xc-5-review.md.\n\nNon-blocking:\n- xc-5.spec.ts:107-109: add a check that the original account still signs in after the used-email attempt.\n- xc-5.spec.ts:149: canSignIn with 'not-an-email' is always false (the API rejects the format), so it proves nothing. The bad-email and short-password steps don't check that Sign out is absent (the URL check covers it).\n- xc-5.spec.ts:17-21: each run creates about 3 throwaway accounts on the shared API. Worth documenting.\n- AC1 and AC2 tests overlap but each checks something different. No change needed."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T11:52",
          "body": "AC1 — I can create an account by entering an email and a password: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-5/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T11:52",
          "body": "AC2 — After signing up, I am signed in and taken into the app: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-5/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T11:52",
          "body": "AC3 — If the email is already used or the details are invalid, I see a clear message and no account is created: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-5/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T11:52",
          "body": "QA evidence summary for XC-5 (3/3 pass):\n- AC1 — Create an account with email and password: pass\n- AC2 — Signed in and taken into the app after sign-up: pass\n- AC3 — Used email / invalid details show a clear message, no account created: pass\n\nRe-run the evidence (from src/frontend, dev server running, sign-in saved): pnpm e2e:evidence e2e/xc-5.spec.ts"
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T11:58",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-6",
      "type": "Story",
      "title": "Sign in",
      "description": "As a returning user, I want to sign in with my email and password, so that I can get back to my timeline.\n\nSource: docs/stories/x-clone-v3-epic-1-stories.md#story-12-sign-in",
      "acceptanceCriteria": [
        "I can sign in by entering my email and password.",
        "After signing in, I am taken to the home timeline.",
        "If my email or password is wrong, I see a clear message and stay signed out."
      ],
      "parent": "XC-1",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-1-stories.md#story-12-sign-in",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T12:42",
      "updates": 12,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:35",
          "body": "Started from 1b55b84."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:36",
          "body": "Ready for review (commit on top of base 1b55b84).\n\nFiles changed:\n- src/frontend/e2e/xc-6.spec.ts (new): AC1–AC3, each in a signed-out context with a fresh account created via the API\n- src/frontend/src/lib/auth-errors.test.ts (new): unit tests for mapAuthErrorToMessage\n\nNo app code changed: the sign-in screen, error mapping and redirect to / from the starter scaffold already met every criterion; the tests were written first and passed against it.\n\nChecks (round 2, all green): tsc -b pass · lint pass · vitest related pass (5) · e2e xc-6 pass (3/3) · pnpm test pass (20) · pnpm e2e pass (11/11).\nRound 1: tsc, lint, e2e xc-6 pass; no unit tests yet.\n\nDecisions made unattended:\n- Kept the existing message \"Incorrect email or password.\" for both a wrong password and an unknown email (doesn't reveal which accounts exist; NF4).\n- AC2 \"home timeline\" is checked as URL /, the Home heading and either a tweet or the empty state.\n- AC3 \"stay signed out\" is checked by no Sign out button and / redirecting back to /sign-in.\n\nFor the reviewer: the tests create throwaway xc6-*@example.com accounts on the shared API (same approach as XC-5)."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T12:37",
          "body": "Review: APPROVE (base 1b55b84). No blocking findings. Saved to docs/reviews/xc-6-review.md.\n\nNon-blocking:\n- e2e/xc-6.spec.ts:24 — each run creates 3 throwaway accounts on the shared API (same as XC-5).\n- e2e/xc-6.spec.ts:98,109 — exact-text check couples the spec to the copy in lib/auth-errors.ts.\n- lib/auth-errors.ts:13 — unknown error codes show the server's raw message (outside XC-6's criteria).\n\nCriteria → tests: AC1 ok · AC2 ok · AC3 ok."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:39",
          "body": "AC1 — Sign in with email and password: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-6/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:39",
          "body": "AC2 — After signing in, taken to the home timeline: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-6/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:39",
          "body": "AC3 — Wrong email or password shows a clear message, stays signed out: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-6/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:39",
          "body": "QA evidence summary (evidence run, 3/3 passed):\n- AC1 — Sign in with email and password: pass\n- AC2 — Taken to the home timeline after signing in: pass\n- AC3 — Wrong email or password: clear message, stays signed out: pass\n\nRe-run: cd src/frontend && pnpm e2e:evidence e2e/xc-6.spec.ts\n\nMoving to In Acceptance for a person to watch and accept."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T12:42",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-7",
      "type": "Story",
      "title": "Keep the app behind sign-in",
      "description": "As a visitor who is not signed in, I want to only see the sign-in and sign-up screens, so that the rest of the app stays private to signed-in users.\n\nSource: docs/stories/x-clone-v3-epic-1-stories.md#story-13-keep-the-app-behind-sign-in",
      "acceptanceCriteria": [
        "When I am not signed in, I can only see the sign-in and sign-up screens.",
        "If I open any other page while signed out, I am sent to the sign-in screen."
      ],
      "parent": "XC-1",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-1-stories.md#story-13-keep-the-app-behind-sign-in",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T12:53",
      "updates": 22,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:39",
          "body": "Started from eb6ce8d."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:41",
          "body": "Ready for review (ccd42a5 on top of base eb6ce8d).\n\nFiles changed:\n- src/frontend/src/routes/_app/$.tsx (new): a catch-all route under the signed-in /_app layout. Every path no other route matches now goes through the same sign-in guard, so signed out it redirects to /sign-in. Signed in, it shows \"Page not found\" with a \"Back to Home\" button (reuses components/ui Button).\n- src/frontend/src/routeTree.gen.ts: regenerated by the router plugin (not hand-edited).\n- src/frontend/e2e/xc-7.spec.ts (new): AC1 and AC2, signed-out context.\n\nRoot cause: \"/\" was already guarded by _app.tsx, but any other path (e.g. /settings) fell through to the router's bare \"Not Found\" page while signed out. The tests showed this: round 1 was red with /settings not redirected.\n\nChecks:\n- Round 1: tsc pass · lint pass · e2e xc-7 FAIL (2/2, as expected before the fix).\n- Round 2: tsc pass · lint pass · vitest related: no related tests (the route has no logic) · e2e xc-7 pass (2/2) · pnpm test pass (20) · pnpm e2e pass (13/13).\n- Also checked by hand (no file written): signed in, /settings shows \"Page not found\" inside the app header, and \"Back to Home\" goes to /.\n\nDecisions made unattended:\n- Signed-in unknown URLs show an in-app \"Page not found\" page. A person might prefer a redirect to Home.\n- The sign-in redirect does not remember the page that was asked for (no ?redirect=), because the story does not ask for it.\n- AC1 also checks that /api/timeline is never requested while signed out, so nothing private is fetched before a redirect.\n- No Vitest test was added: the change is a route with no logic, and the e2e tests cover it.\n\nFor the reviewer: the last AC2 step simulates moving to another page without a reload (history.pushState plus popstate) to cover the client-side redirect, not just full page loads."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T12:42",
          "body": "Review: APPROVE (base eb6ce8d). No blocking findings. Saved to docs/reviews/xc-7-review.md.\n\nNon-blocking:\n- routes/_app/$.tsx:15 — the signed-in \"Page not found\" page has no spec; consider a check in a later story.\n- routes/_app.tsx:18 — the sign-in redirect drops the requested page, so people land on Home after signing in; for the PO to consider.\n- e2e/xc-7.spec.ts:7 — signed-out context used correctly; nothing to change.\n\nCriteria → tests: AC1 ok · AC2 ok."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:43",
          "body": "AC1 — Signed out, only the sign-in and sign-up screens are visible: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-7/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:43",
          "body": "AC2 — Any other page while signed out sends me to sign-in: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-7/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:43",
          "body": "QA evidence summary (evidence run, 2/2 passed):\n- AC1 — Signed out, only the sign-in and sign-up screens are visible: pass\n- AC2 — Any other page while signed out sends me to sign-in: pass\n\nRe-run: cd src/frontend && pnpm e2e:evidence e2e/xc-7.spec.ts\n\nMoving to In Acceptance for a person to watch and accept."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T12:47",
          "body": "The sign-in redirect should be implemented, to redirect to the request page after successful sign-in"
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T12:47",
          "body": "Pushed back by PO karcsi: Missing requirement: The sign-in redirect should be implemented, to redirect to the request page after successful sign-in"
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:48",
          "body": "Started (send-back 1: the PO asked that sign-in return people to the page they asked for) from ccd42a5."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:50",
          "body": "Ready for review (send-back 1). The commit sits on top of base ccd42a5.\n\nTo-do from the PO: after signing in, return people to the page they asked for. Done.\n\nFiles changed:\n- src/frontend/src/routes/_app.tsx: the signed-out redirect now carries ?redirect=<the page asked for>, with its query and hash. Home (\"/\") is left out, because signing in leads there anyway.\n- src/frontend/src/routes/_auth/sign-in.tsx: validateSearch reads `redirect`, passes it through safeRedirectPath, and hands it to the submit hook.\n- src/frontend/src/hooks/use-auth-submit.ts: an optional redirectTo. After signing in it navigates there, or to Home when it's empty. Sign-up is unchanged.\n- src/frontend/src/routes/_auth.tsx: if someone who is already signed in opens /sign-in?redirect=…, they are sent to that page (if it's safe) instead of Home.\n- src/frontend/src/lib/redirect.ts (new) and redirect.test.ts (new): safeRedirectPath keeps only same-origin in-app paths. It rejects absolute, protocol-relative (//, /\\, /<tab>/), javascript: and relative values, and /sign-in or /sign-up (which would loop).\n- src/frontend/e2e/xc-7.spec.ts: AC2 changed.\n\nTest change, and why: AC2 used to expect the URL to end in /sign-in. With the PO's requirement that check is wrong, because the URL now carries ?redirect=. AC2 now checks pathname /sign-in plus the exact redirect value for every page, and its new last steps sign in from /tweets/123?tab=replies#top and check we land back on exactly that page. Nothing was weakened; AC1 is unchanged.\n\nChecks:\n- Round 1: tsc pass · lint pass · e2e xc-7 AC2 FAIL (no redirect remembered, as expected) · AC1 pass.\n- Round 2: tsc pass · lint pass · vitest related pass (4) · e2e xc-7 pass (2/2) · pnpm test pass (24) · pnpm e2e pass (13/13).\n- Also checked by hand, signed in (no file written): /sign-in?redirect=/settings goes to /settings; //evil.example and https://evil.example both go to /; plain /sign-in goes to /.\n\nDecisions made unattended:\n- The return path is carried in the URL (?redirect=), not in storage, so it survives a reload and works in a new tab.\n- Only same-origin paths are honoured (otherwise the redirect could send people to another site, NF4). Anything else falls back to Home without an error.\n- The \"Sign up\" link on the sign-in screen does not carry the redirect, so signing up still lands on Home (XC-5 AC2 unchanged). Easy to add if the PO wants it.\n- The return page is checked on a \"Page not found\" address, because Home is the only real page the app has so far."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T12:51",
          "body": "Review (send-back 1): APPROVE (base ccd42a5). No blocking findings. Saved as round 2 in docs/reviews/xc-7-review.md.\n\nOpen redirect checked: only same-origin in-app paths are followed.\n\nNon-blocking:\n- routes/_auth/sign-in.tsx:126 — the \"Sign up\" link drops ?redirect=, so signing up from a deep link lands on Home (the PO asked only about sign-in; a cheap follow-up).\n- routes/_app.tsx — the param is left out only for an exact \"/\"; /?x=1 keeps it, which is harmless.\n- e2e/xc-7.spec.ts:28 — each run adds a throwaway account on the shared API (same pattern as XC-5 and XC-6).\n\nCriteria → tests: AC1 ok · AC2 ok, stricter · PO send-back ok."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:53",
          "body": "AC1 — Signed out, only the sign-in and sign-up screens are visible: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-7/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:53",
          "body": "AC2 — Any other page while signed out sends me to sign-in, and signing in returns me to that page (PO send-back): pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-7/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:53",
          "body": "QA evidence summary, send-back 1 (evidence run, 2/2 passed):\n- AC1 — Signed out, only the sign-in and sign-up screens are visible: pass\n- AC2 — Any other page while signed out sends me to sign-in: pass. The PO send-back is in the same video, near the end: sign in from /tweets/123?tab=replies#top and land back on that exact page.\n\nRe-run: cd src/frontend && pnpm e2e:evidence e2e/xc-7.spec.ts\n\nMoving to In Acceptance for a person to watch and accept."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T12:53",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-8",
      "type": "Story",
      "title": "Scroll the home timeline",
      "description": "As a signed-in user, I want to scroll a timeline of the newest tweets from everyone, so that I can see what people are posting.\n\nSource: docs/stories/x-clone-v3-epic-2-stories.md#story-21-scroll-the-home-timeline",
      "acceptanceCriteria": [
        "The home timeline shows tweets from all users, newest first.",
        "More tweets load automatically as I scroll, with no \"next page\" button.",
        "Each tweet shows the author's name and handle, when it was posted, the text, and the image if there is one.",
        "If there are no tweets yet, I see a simple empty message."
      ],
      "parent": "XC-2",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-2-stories.md#story-21-scroll-the-home-timeline",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T12:28",
      "updates": 26,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:10",
          "body": "Started from f96528e."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:13",
          "body": "Blocked: question for the product owner before any code is written.\n\nAC1 says \"The home timeline shows tweets from all users, newest first\", and the PRD backs it (R4; Out of Scope: \"Following people (everyone sees the same timeline)\").\n\nThe shared API can't serve that as-is (checked /api/openapi.json):\n- GET /api/timeline, the only cursor-paginated feed (needed for AC2, infinite scroll), returns only the caller's own top-level tweets plus those of the people they follow.\n- GET /api/search/tweets spans all authors but needs a 1-100 char query, isn't paginated and caps at 50.\n- NF5 rules out new backend work.\n\nOptions for the PO:\n1. Accept /api/timeline's semantics for v1 (own + followed accounts) and reword AC1/R4.\n2. Ask the backend for an \"all tweets\" paginated feed (an exception to NF5).\n3. Have the app follow every user automatically so /api/timeline covers everyone (changes each account's shared follow state; brings in following, which is out of scope).\n\nTicket stays In Progress. No commits made; base is f96528e."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T12:15",
          "body": "Go with Option #1"
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:19",
          "body": "Built in f41ccfe (base f96528e). AC1 follows the PO's decision (option 1, 12:15): the timeline is GET /api/timeline, i.e. the reader's own tweets plus those of the accounts they follow, newest first.\n\nFiles changed\n- src/queries/timeline.ts (+ test): infinite query on /api/timeline, 20 per page, cursor paging, credentials: \"include\"\n- src/hooks/use-load-more-on-scroll.ts (+ test): IntersectionObserver sentinel, re-armed after each page\n- src/components/tweet-card.tsx (+ test): name, @handle, relative time in <time datetime>, text, images\n- src/lib/user.ts (+ test): formatHandle\n- src/routes/_app/index.tsx: the home page is now the timeline, with loading, empty (\"No tweets yet…\"), error and retry states (replaces the \"Welcome\" placeholder)\n- e2e/xc-8.spec.ts: one test per AC\n\nChecks\n- pnpm exec tsc -b: pass\n- pnpm lint: pass\n- pnpm test (Vitest): 15/15 pass\n- pnpm e2e e2e/xc-8.spec.ts: 4/4 pass (green on the 3rd run: run 1 was missing an Origin header in the test setup; run 2 caught the @@handle bug below)\n- pnpm e2e e2e/smoke.spec.ts: pass. xc-5.spec.ts not re-run (it signs up accounts on the shared API; the sign-up screens didn't change)\n\nFor the reviewer\n- AC1's text still says \"all users\". Rewording it to match the PO's decision is up to the PO.\n- The API is inconsistent about handles: the sign-up user's handle has no \"@\", but the timeline's author.handle starts with one. formatHandle shows exactly one \"@\" either way.\n- The e2e tests sign up throwaway accounts (xc8-…@example.com) on the shared API and post about 30 tweets per run, one with a 1x1 PNG. Each test signs its own browser context in with that account's cookie; the person's saved sign-in is never used or changed. Ran with the person's OK.\n- The next-page error state has a \"Try again\" button. It only appears after a failed load, so it isn't a \"next page\" button (AC2).\n- Like, retweet and reply counts are in the Tweet type but not shown yet; that's XC-10, XC-11 and XC-12."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T12:21",
          "body": "Review: APPROVE, no blocking findings (base f96528e). Full review: docs/reviews/xc-8-review.md\n\nNon-blocking:\n1. AC1/R4 still say \"all users\", but the build follows the PO's option 1 (own + followed accounts). The story text needs the PO's rewording.\n2. xc-8.spec.ts:32: each run adds 5 throwaway accounts and about 30 tweets to the shared API.\n3. xc-8.spec.ts:15: BASE_URL repeats playwright.config.ts's baseURL.\n4. xc-8.spec.ts:120: the check for 20 tweets before scrolling depends on the 1280x720 viewport and the 400px rootMargin, so it could get flaky.\n5. xc-8.spec.ts:159: the time regex is loose; the datetime attribute check is what really covers the time."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:23",
          "body": "AC1 — The home timeline shows tweets from all users, newest first: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:23",
          "body": "AC2 — More tweets load automatically as I scroll, with no next-page button: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:23",
          "body": "AC3 — Each tweet shows name and handle, time, text and image: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:23",
          "body": "AC4 — No tweets yet shows a simple empty message: fail\nError: strict mode violation: getByText('No tweets yet') resolved to 2 elements: the app's empty message (\"No tweets yet. When people post, their tweets show up here.\") and the evidence caption div#__ev-caption (\"A simple message says there are no tweets yet\"). The app's message does render; the test's locator (e2e/xc-8.spec.ts, AC4) also matches the evidence-only caption, so it fails only in the evidence project.",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac4.webm",
              "label": "AC4",
              "ac": 4,
              "result": "fail"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:23",
          "body": "QA evidence summary (pnpm e2e:evidence e2e/xc-8.spec.ts, run once):\n- AC1 — Tweets from all users, newest first (PO option 1: own + followed): pass\n- AC2 — More tweets load automatically on scroll, no next-page button: pass\n- AC3 — Name, handle, time, text and image: pass\n- AC4 — Simple empty message: FAIL\n\nRe-run: cd src/frontend && pnpm e2e:evidence e2e/xc-8.spec.ts"
        },
        {
          "author": "Claude",
          "role": "QA",
          "created": "2026-11-18T12:23",
          "body": "Back to In Progress: AC4 failed in the QA evidence run.\n\n- AC4 — e2e/xc-8.spec.ts (AC4 test, \"A simple message says there are no tweets yet\" step): Error: strict mode violation: getByText('No tweets yet') resolved to 2 elements.\n  The second element is the evidence caption (div#__ev-caption), whose text contains \"no tweets yet\". In the video the app's empty message is on screen, so this looks like a test defect: the locator has to match the app's message only (for example scoped to the main element), and the caption has to stop matching it. It passed in the verify project because captions are only shown in evidence runs.\n\nTo do: fix the AC4 locator so it passes in both verify and evidence, then re-run QA."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:25",
          "body": "Started from 0ed81e3, to fix QA's AC4 finding (the locator also matched the evidence caption)."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:26",
          "body": "Fixed QA's AC4 finding in 4335385 (base 0ed81e3).\n\nFiles changed\n- e2e/xc-8.spec.ts: the AC4 locator now looks only inside the page's main element (page.getByRole(\"main\").getByText(\"No tweets yet\")). This changes a test because it was wrong about its criterion, not to weaken it. It also matched the evidence caption (\"A simple message says there are no tweets yet\"), which only appears in evidence runs. It still checks the same message, plus that there are no tweets. No app code changed.\n\nChecks\n- pnpm exec tsc -b: pass\n- pnpm lint: pass\n- pnpm e2e e2e/xc-8.spec.ts: 4/4 pass\n- pnpm e2e:evidence e2e/xc-8.spec.ts -g AC4: pass (the run where it failed before)\n\nFor the reviewer\n- AC1–AC3 already looked only inside main (articles), and AC2's button/link checks can't match a caption, so no other test had the same problem.\n- The review's non-blocking notes (BASE_URL duplicate, the count of 20 before scrolling, the loose time regex) weren't changed; they're out of scope for this fix."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T12:27",
          "body": "Review (round 2, base 0ed81e3): APPROVE, no blocking findings. The AC4 locator, now scoped to main, no longer matches the evidence caption and still checks the real empty message. Full review: docs/reviews/xc-8-review.md\n\nNon-blocking:\n1. xc-8.spec.ts:182: could match the start of the text (/^No tweets yet/) to be stricter.\n2. AC1 relies on the PO's option 1 (own + followed); the story text still says \"all users\"."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:28",
          "body": "AC1 — The home timeline shows tweets from all users, newest first: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:28",
          "body": "AC2 — More tweets load automatically as I scroll, with no next-page button: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:28",
          "body": "AC3 — Each tweet shows name and handle, time, text and image: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:28",
          "body": "AC4 — No tweets yet shows a simple empty message: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-8/ac4.webm",
              "label": "AC4",
              "ac": 4,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T12:28",
          "body": "QA evidence summary, round 2 (pnpm e2e:evidence e2e/xc-8.spec.ts, run once):\n- AC1 — The home timeline shows tweets from all users, newest first: pass\n- AC2 — More tweets load automatically as I scroll, with no next-page button: pass\n- AC3 — Each tweet shows name and handle, time, text and image: pass\n- AC4 — No tweets yet shows a simple empty message: pass\n\nRe-run: cd src/frontend && pnpm e2e:evidence e2e/xc-8.spec.ts"
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T12:28",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-9",
      "type": "Story",
      "title": "Post a tweet",
      "description": "As a signed-in user, I want to write a short tweet and optionally attach one image, so that I can share what I'm up to.\n\nSource: docs/stories/x-clone-v3-epic-2-stories.md#story-22-post-a-tweet",
      "acceptanceCriteria": [
        "I can type a tweet and post it, with or without one image.",
        "My new tweet appears at the top of my timeline straight away.",
        "I cannot post an empty tweet.",
        "If the tweet is too long or the image is not allowed, I see a clear message (the length and image limits are Not known yet)."
      ],
      "parent": "XC-2",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-2-stories.md#story-22-post-a-tweet",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T13:34",
      "updates": 14,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:20",
          "body": "Started from 04e8853."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:27",
          "body": "Ready for review at 86fe4d9 (base 04e8853).\n\n**Files changed**\n- src/frontend/src/components/tweet-composer.tsx (+ test, new): the composer at the top of Home. It has a textarea (\"What's happening?\"), \"Add an image\" (one image, with a preview and a Remove button), a countdown for the last 20 characters, an inline message (role=alert) and Post. Ctrl/Cmd+Enter posts.\n- src/frontend/src/hooks/use-post-tweet.ts (+ test, new): usePostTweet uploads the image if there is one, then posts. It is optimistic: a pending tweet, shown as you, goes on top of the timeline at once and is swapped for the saved tweet when the API answers. If posting fails, it is taken off again. isPendingTweet().\n- src/frontend/src/queries/tweets.ts (+ test): uploadImage (POST /api/upload, multipart), postTweet (POST /api/tweets), tweetLengthProblem, imageProblem, TweetRejectedError, and the limits TWEET_MAX_LENGTH, IMAGE_TYPES and IMAGE_MAX_BYTES.\n- src/frontend/src/queries/timeline.ts (+ test): prependTimelineTweet and removeTimelineTweet, next to updateTimelineTweet.\n- src/frontend/src/components/tweet-card.tsx (+ test): a pending tweet shows \"Posting…\" in place of the reply, retweet and like buttons.\n- src/frontend/src/routes/_app/index.tsx: renders the composer above the timeline.\n- src/frontend/e2e/xc-9.spec.ts: AC1–AC4.\n\n**Checks**\n- Round 1: tsc FAIL (a unit test used Promise.withResolvers, which isn't in the configured lib) · lint FAIL (unused variable in the same test) · vitest related pass · e2e xc-9 4/4 pass.\n- Round 2, all green: tsc -b pass · lint pass · vitest related 58/58 · e2e xc-9 4/4 · vitest full 80/80 · e2e full 26/26.\n\n**Decisions made without asking**\n1. The limits the story calls \"Not known yet\" are taken from the API itself (/api/openapi.json): 280 characters after trimming; images must be JPEG, PNG, GIF or WebP, up to 5 MB. If the PO picks other limits, they are constants in queries/tweets.ts. The PRD's open questions are unchanged.\n2. Too long: the box does not cut the text off (no maxLength). It says \"Your tweet is N character(s) too long. The limit is 280.\" and Post is disabled. A silent cut would hide the message the criterion asks for.\n3. Image not allowed: \"That image can't be posted. Use a JPEG, PNG, GIF or WebP image of up to 5 MB.\" This shows for the wrong type or more than 5 MB, checked when the file is chosen. The same message shows when the API refuses a file that only looks like an image (it checks the bytes). In that case the text stays in the box and the image is dropped.\n4. Posting is optimistic, because NF1 names new posts. The tweet is on top at once and the box is cleared. On any other failure, the tweet comes off the timeline, the text and image go back into the box, and the composer says \"Couldn't post your tweet. Try again.\"\n5. A tweet with only an image, and no text, can be posted. The API accepts it, and it isn't empty. Spaces and new lines alone count as empty.\n6. One image per tweet, as the story says, even though the API takes up to 4. \"Add an image\" goes away once one is attached.\n7. No @xbot handling: no story asks for it (the same decision as XC-12).\n8. The spec runs on the saved sign-in. Each run posts 3 \"XC-9 test\" tweets on your account (one with a 1x1 PNG); the API can't delete them. AC2 holds the POST for a while to show the tweet appears before the API answers. AC4 also uploads one fake .png, which the API refuses.\n\n**For the reviewer:** use-post-tweet.ts (the swap from pending to saved, and the case where the timeline isn't cached) and the error-restore path in tweet-composer.tsx's submit."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:27",
          "body": "Correction to the round count above: there were 3 rounds, not 2.\n- Round 1: tsc pass · lint FAIL (unused variable in use-post-tweet.test.tsx) · vitest related pass (58) · e2e not run.\n- Round 2: tsc FAIL (Promise.withResolvers is not in the configured lib) · lint pass · vitest related pass · e2e xc-9 4/4 pass.\n- Round 3, all green: tsc -b pass · lint pass · vitest related 58/58 · e2e xc-9 4/4 · vitest full 80/80 · e2e full 26/26.\nOnly the test file changed between rounds; the app code did not."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T13:28",
          "body": "Review: APPROVE (base 04e8853). No blocking findings. Saved to docs/reviews/xc-9-review.md.\n\nNon-blocking:\n- tweet-composer.tsx:65: the image is dropped on any TweetRejectedError, including a 400 from postTweet, where the image was fine. It should only be dropped when the upload itself was refused.\n- queries/tweets.ts:105: \"The tweet couldn't be posted as it is.\" doesn't say what to fix. Show the API's reason if it gives one.\n- e2e/xc-9.spec.ts:128-166: no e2e step posts an image with no text (only the unit test covers that).\n- e2e/xc-9.spec.ts:201-204: after the reload, the check expects our tweet to be first. On the shared API someone's newer tweet could take that spot and make it flaky. Match the tweet by its text instead.\n- tweet-composer.test.tsx:31-32: wrong indentation in beforeEach.\n- tweet-card.tsx:9: the card imports isPendingTweet from a hook module. A helper in queries/timeline.ts would be tidier.\n\nCriteria → tests: AC1 ok · AC2 ok · AC3 ok · AC4 ok."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:30",
          "body": "AC1 — I can type a tweet and post it, with or without one image: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-9/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:30",
          "body": "AC2 — My new tweet appears at the top of my timeline straight away: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-9/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:30",
          "body": "AC3 — I cannot post an empty tweet: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-9/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:30",
          "body": "AC4 — A tweet that's too long or an image that isn't allowed shows a clear message: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-9/ac4.webm",
              "label": "AC4",
              "ac": 4,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:30",
          "body": "QA evidence summary for XC-9 (4/4 pass):\n- AC1 — I can type a tweet and post it, with or without one image: pass\n- AC2 — My new tweet appears at the top of my timeline straight away: pass\n- AC3 — I cannot post an empty tweet: pass\n- AC4 — A tweet that's too long or an image that isn't allowed shows a clear message: pass\n\nRe-run the evidence (from src/frontend, dev server running, sign-in saved): pnpm e2e:evidence e2e/xc-9.spec.ts"
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T13:34",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-10",
      "type": "Story",
      "title": "Like and unlike a tweet",
      "description": "As a signed-in user, I want to like a tweet with one tap and undo it with one tap, so that I can react quickly.\n\nSource: docs/stories/x-clone-v3-epic-3-stories.md#story-31-like-and-unlike-a-tweet",
      "acceptanceCriteria": [
        "Tapping like once likes the tweet; tapping again removes my like.",
        "The like count and the button state update immediately, even on a slow connection.",
        "If saving my like fails, the count goes back to what it was and I see a message."
      ],
      "parent": "XC-3",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-3-stories.md#story-31-like-and-unlike-a-tweet",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T13:39",
      "updates": 28,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T12:54",
          "body": "Started from 3ffbdcc."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:00",
          "body": "Ready for review at 17f3644 (base 3ffbdcc).\n\n**Files changed**\n- src/frontend/src/queries/tweets.ts (+ test): setTweetLiked — POST/DELETE /api/tweets/:id/like, credentials included.\n- src/frontend/src/queries/timeline.ts (+ test): updateTimelineTweet — patches one tweet in the cached timeline, keeping other pages/tweets by reference.\n- src/frontend/src/hooks/use-like-tweet.ts (+ test): optimistic like/unlike mutation; rolls back and shows a toast on failure.\n- src/frontend/src/components/tweet-card.tsx (+ test): like button in a card footer.\n- src/frontend/e2e/accounts.ts (new, shared): throwaway-account helpers (sign up, post, follow, read a tweet back, sign the browser in). Same approach as xc-8, for the epic 3 specs.\n- src/frontend/e2e/xc-10.spec.ts: AC1–AC3.\n\n**Checks (round 3, all in one round)**\n- tsc -b: pass · lint: pass · vitest related: pass (19) · e2e xc-10: 3/3 pass\n- vitest full: 35/35 pass · e2e full (verify): 16/16 pass\n- Round 1: tsc, lint and one unit test failed (type of the cache helper, a non-hook named useAccount, a reused Response body). Round 2: story green, but xc-8 AC2/AC3 regressed (see below). Round 3: all green.\n\n**Decisions made without asking (unattended run)**\n1. Optimistic update in the timeline cache; on success the server count is taken unless another tap on the same tweet is still in flight; on failure only that tap is undone (a later tap stands). The button is never disabled, so rapid taps stay instant.\n2. Failure message is a toast: \"Couldn't like the tweet. Try again.\" / \"Couldn't remove your like. Try again.\"\n3. A zero like count shows no number (X convention). The button's accessible name always carries the count (\"Like, 3 likes\") and aria-pressed carries the state. This also fixed an xc-8 regression: a visible \"0\" made the card text end in \"…Tweet number 10\".\n4. The heart icon is aria-hidden (decorative). It had shown up as a second img in the card and broken xc-8 AC3.\n5. E2E uses throwaway accounts (author + follower reader); the person's account is never liked/unliked. AC2 simulates a slow connection with a 4 s route delay and requires the change within 500 ms; AC3 fulfils the like request with a 500.\n6. tweet-card.test.tsx now renders inside a QueryClientProvider (the card needs it); no existing assertion changed.\n\n**For the reviewer**\n- The rollback/race logic in use-like-tweet.ts (onSuccess skip, onError conditional undo).\n- I wrote my own spec's count checks against a visible \"0\" first and changed them to the expectLikes helper once zero counts became blank — no xc-8 test was changed.\n- No backend changes; NF1 met via optimistic UI."
        },
        {
          "author": "Claude",
          "role": "QA",
          "created": "2026-11-18T13:02",
          "body": "Review: CHANGES NEEDED (docs/reviews/xc-10-review.md, base 3ffbdcc).\n\nTo do (blocking):\n1. src/frontend/e2e/accounts.ts:10,29-43,66-71, used by e2e/xc-10.spec.ts:22-33: the spec signs up throwaway accounts with a hard-coded password and injects their cookies. CLAUDE.md says to run signed in as the person (saved e2e/.auth/user.json) and never sign in or handle a password. It also leaves 6 junk accounts per run on the shared API. Change: use the saved sign-in. Each test posts a fresh tweet as that account, likes and unlikes it, and leaves it unliked. Remove signUp, signInAs, follow and PASSWORD.\n\nAlso worth doing (non-blocking):\n- accounts.ts:11: hard-coded BASE_URL. Use the configured baseURL.\n- accounts.ts:25: the top-level afterEach in a shared module. Register cleanup per spec, or use a fixture.\n- xc-10.spec.ts AC3: also cover a failed unlike and its message.\n\nNote for a person: the accepted XC-8 spec (e2e/xc-8.spec.ts) uses the same throwaway-account pattern. The rule may be worth a decision."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:02",
          "body": "Started send-back cycle 1 from 17f3644 (story base is still 3ffbdcc). Working the review's to-do list."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:04",
          "body": "Send-back cycle 1 done. Ready for review at 947b723 (story base still 3ffbdcc).\n\n**Review to-do: done**\n1. (blocking) The spec no longer signs up accounts or handles passwords. src/frontend/e2e/accounts.ts is deleted, and xc-10.spec.ts runs on the saved sign-in (e2e/.auth/user.json). API calls go through page.request, which shares the browser's cookies. Each test posts a fresh tweet as you, so its count starts at 0. An afterEach DELETEs the like on every tweet the test posted, leaving it unliked.\n- (non-blocking) The hard-coded BASE_URL and the shared afterEach went with accounts.ts.\n- (non-blocking) AC3 now also covers a failed unlike: the tweet is liked through the API and the unlike is routed to a 500. The like comes back, \"Couldn't remove your like. Try again.\" shows, and the server still has it liked.\n\n**Files changed this cycle:** e2e/xc-10.spec.ts (rewritten setup, extended AC3), e2e/accounts.ts (deleted), docs/reviews/xc-10-review.md (the review, committed). No app code changed.\n\n**Checks (one round, all green):** tsc -b pass · lint pass · vitest related 19/19 · e2e xc-10 3/3 · vitest full 35/35 · e2e full 16/16.\n\n**Decisions made without asking**\n- The API has no endpoint to delete a tweet, so every run leaves 3 test tweets on your own account (\"XC-10 test: …\", unliked). I accepted that as the reviewer's prescription. Worth knowing before running the suite often.\n- I changed the AC3 test to cover the unlike direction as well. It checks more now, not less."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T13:05",
          "body": "Review: APPROVE (round 2, docs/reviews/xc-10-review.md, change set 3ffbdcc..947b723). No blocking findings; round 1 blocker fixed.\nNon-blocking:\n- e2e/xc-10.spec.ts:21-27: each run leaves 3 test tweets on your account (the API has no delete). Their text is marked \"XC-10 test: …\".\n- e2e/xc-10.spec.ts:30-37: savedTweet reads only the first 50 timeline items, which could be flaky under heavy shared posting.\n- src/queries/tweets.ts:1-12: a mutation function rather than queryOptions. Correct for a write; nothing to change.\n- src/components/tweet-card.tsx:77: comment wording, \"Like X\" → \"As on X\"."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:07",
          "body": "AC1 — Tapping like once likes the tweet; tapping again removes my like: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-10/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:07",
          "body": "AC2 — The like count and the button state update immediately, even on a slow connection: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-10/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:07",
          "body": "AC3 — If saving my like fails, the count goes back to what it was and I see a message: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-10/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:07",
          "body": "QA evidence: all 3 criteria pass.\n- AC1 — Tapping like once likes the tweet; tapping again removes my like: pass\n- AC2 — The like count and the button state update immediately, even on a slow connection: pass\n- AC3 — If saving my like fails, the count goes back to what it was and I see a message: pass\n\nRe-run the evidence: `pnpm e2e:evidence e2e/xc-10.spec.ts` (from src/frontend). Moving to In Acceptance for a person to watch and decide."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T13:20",
          "body": "PO karcsi: In Acceptance → Done"
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T13:34",
          "body": "Pushed back by PO karcsi: AC3: “when a like fails, the message should say Couldn't save your like. Try again., not a generic error”."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:35",
          "body": "Started from e407f13 (send-back from PO: failed-like message must read \"Couldn't save your like. Try again.\")."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:37",
          "body": "Ready for review (commit on top of base e407f13).\n\nPO send-back fixed: a failed like now shows \"Couldn't save your like. Try again.\"\n\nFiles changed:\n- src/hooks/use-like-tweet.ts: failed-like message\n- src/hooks/use-like-tweet.test.tsx: unit test expects the new message\n- e2e/xc-10.spec.ts: AC3 expects the new message (the test was updated first and failed before the code changed)\n\nChecks (round 1): tsc pass · lint pass · vitest related 14/14 pass · e2e xc-10 3/3 pass · vitest 80/80 pass · full e2e 26/26 pass.\n\nDecisions made without asking:\n- The failed-unlike message stays \"Couldn't remove your like. Try again.\" The PO's note names only a failed like, and \"save\" wouldn't describe removing a like. A reviewer or the PO should confirm."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T13:37",
          "body": "Review: APPROVE (round 3, docs/reviews/xc-10-review.md, change set e407f13..18c0bf5). No blocking findings.\nNon-blocking:\n- src/hooks/use-like-tweet.ts:22: the unlike-failure message is still \"Couldn't remove your like. Try again.\" If the PO meant both messages, confirm here."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:39",
          "body": "AC1 — Tapping like once likes the tweet; tapping again removes my like: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-10/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:39",
          "body": "AC2 — The like count and the button state update immediately, even on a slow connection: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-10/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:39",
          "body": "AC3 — If saving my like fails, the count goes back to what it was and I see a message: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-10/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:39",
          "body": "QA evidence: all 3 criteria pass. AC3 now shows \"Couldn't save your like. Try again.\" (the PO send-back).\n- AC1 — Tapping like once likes the tweet; tapping again removes my like: pass\n- AC2 — The like count and the button state update immediately, even on a slow connection: pass\n- AC3 — If saving my like fails, the count goes back to what it was and I see a message: pass\n\nRe-run the evidence: `pnpm e2e:evidence e2e/xc-10.spec.ts` (from src/frontend). Moving to In Acceptance for a person to watch and decide."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T13:39",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-11",
      "type": "Story",
      "title": "Retweet and undo a retweet",
      "description": "As a signed-in user, I want to retweet a tweet with one tap and undo it with one tap, so that I can share it with others.\n\nSource: docs/stories/x-clone-v3-epic-3-stories.md#story-32-retweet-and-undo-a-retweet",
      "acceptanceCriteria": [
        "Tapping retweet once retweets the tweet; tapping again undoes it.",
        "The retweet count and the button state update immediately, even on a slow connection.",
        "If saving my retweet fails, the count goes back to what it was and I see a message."
      ],
      "parent": "XC-3",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-3-stories.md#story-32-retweet-and-undo-a-retweet",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T13:34",
      "updates": 12,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:07",
          "body": "Started from 04362c3."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:10",
          "body": "Ready for review at f12861e (base 04362c3).\n\n**Files changed**\n- src/frontend/src/hooks/use-tweet-toggle.ts (new): the optimistic toggle from XC-10, made generic. It cancels in-flight timeline fetches, patches the cache, takes the server count unless a later tap is still in flight, undoes only this tap on failure, and shows a toast.\n- src/frontend/src/hooks/use-like-tweet.ts: now a thin wrapper over useTweetToggle. Its API (useLikeTweet, withLiked) is unchanged, and its unit tests pass unchanged.\n- src/frontend/src/hooks/use-retweet-tweet.ts (+ test): useRetweetTweet and withRetweeted.\n- src/frontend/src/queries/tweets.ts (+ test): setTweetRetweeted, which POSTs or DELETEs /api/tweets/:id/retweet with credentials included.\n- src/frontend/src/components/tweet-card.tsx (+ test): a retweet button before the like button. The comment wording is fixed per the XC-10 review (\"As on X\").\n- src/frontend/e2e/xc-11.spec.ts: AC1–AC3.\n\n**Checks (round 1, all green):** tsc -b pass · lint pass · vitest related 21/21 · e2e xc-11 3/3 · vitest full 43/43 · e2e full 19/19.\n\n**Decisions made without asking**\n1. Same interaction model as XC-10: optimistic, never disabled, and a zero count shows no number. The label carries the count (\"Retweet, 2 retweets\") and aria-pressed carries the state.\n2. Failure toasts: \"Couldn't retweet. Try again.\" / \"Couldn't undo the retweet. Try again.\"\n3. Retweet is one tap, as the story says, with no X-style menu (no quote tweet; quote tweets are out of scope in the PRD). Green when on.\n4. Like and retweet share one generic hook instead of two copies of the race and rollback logic. That touches XC-10 code (use-like-tweet.ts), but its behaviour and tests are unchanged.\n5. The spec runs on the saved sign-in like XC-10. Each test posts a fresh tweet as you and retweets your own tweet (the API allows it), and an afterEach undoes the retweet. Each run leaves 3 \"XC-11 test: …\" tweets on your account (the API has no delete). AC3 covers a failed retweet and a failed undo.\n6. The timeline does not show a retweet as a separate entry: the API returns the original tweet with retweetedByMe. That is how the app behaves, and nothing was added for it.\n\n**For the reviewer:** use-tweet-toggle.ts (the generic hook) and whether the XC-10 refactor is acceptable inside this story."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T13:11",
          "body": "Review: APPROVE (docs/reviews/xc-11-review.md, change set 04362c3..f12861e). No blocking findings.\nNon-blocking:\n- hooks/use-tweet-toggle.ts:43-46: if the later of two overlapping taps fails, the rollback goes to the optimistic count rather than the server count. This edge case predates the change and no AC test reaches it.\n- e2e/xc-11.spec.ts:184: an over-long line. Wrap it to match the other specs.\n- components/tweet-card.tsx:48: retweet now sits before like (X order). The specs find buttons by name, so nothing breaks."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:12",
          "body": "AC1 — Tapping retweet once retweets the tweet; tapping again undoes it: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-11/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:12",
          "body": "AC2 — The retweet count and the button state update immediately, even on a slow connection: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-11/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:12",
          "body": "AC3 — If saving my retweet fails, the count goes back to what it was and I see a message: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-11/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:12",
          "body": "QA evidence: all 3 criteria pass.\n- AC1 — Tapping retweet once retweets the tweet; tapping again undoes it: pass\n- AC2 — The retweet count and the button state update immediately, even on a slow connection: pass\n- AC3 — If saving my retweet fails, the count goes back to what it was and I see a message: pass\n\nRe-run the evidence: `pnpm e2e:evidence e2e/xc-11.spec.ts` (from src/frontend). Moving to In Acceptance for a person to watch and decide."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T13:34",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-12",
      "type": "Story",
      "title": "Reply to a tweet inline",
      "description": "As a signed-in user, I want to reply to a tweet and see replies right under it, so that I can join the conversation without leaving the timeline.\n\nSource: docs/stories/x-clone-v3-epic-3-stories.md#story-33-reply-to-a-tweet-inline",
      "acceptanceCriteria": [
        "I can write a reply to a tweet from the timeline.",
        "Replies appear directly under that tweet in the timeline, without opening a separate page.",
        "I cannot post an empty reply."
      ],
      "parent": "XC-3",
      "status": "Done",
      "source": "docs/stories/x-clone-v3-epic-3-stories.md#story-33-reply-to-a-tweet-inline",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T13:34",
      "updates": 12,
      "comments": [
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:12",
          "body": "Started from e888a77."
        },
        {
          "author": "Claude",
          "role": "AI Dev",
          "created": "2026-11-18T13:16",
          "body": "Ready for review at ed472aa (base e888a77).\n\n**Files changed**\n- src/frontend/src/queries/replies.ts (+ test): repliesQueryOptions(tweetId) for GET /api/tweets/:id/replies; postReply(parentTweetId, content) for POST /api/tweets with parentTweetId; replyContent(draft), which trims and returns null when blank; REPLY_MAX_LENGTH = 280 (the API limit).\n- src/frontend/src/hooks/use-post-reply.ts (+ test): posts a reply, appends it to the cached replies (or refetches them if none were loaded) and adds one to the tweet's replyCount in the timeline cache.\n- src/frontend/src/components/tweet-replies.tsx (+ test): TweetReplies (the list under a tweet, with loading and error states) and ReplyComposer (inline textarea, Cancel, \"Post reply\").\n- src/frontend/src/components/tweet-body.tsx (new): author, handle, time, text and images, moved out of TweetCard unchanged so tweets and replies share it.\n- src/frontend/src/components/tweet-card.tsx (+ test): a Reply button (first, as on X) that opens the composer, and the replies under the tweet.\n- src/frontend/e2e/xc-12.spec.ts: AC1–AC3.\n\n**Checks (round 2, all green):** tsc -b pass · lint pass · vitest related 19/19 · e2e xc-12 3/3 · vitest full 55/55 · e2e full 22/22. Round 1 failed one unit test that didn't wait for the async mutation. I fixed the test's waiting, not its expectation.\n\n**Decisions made without asking**\n1. Replies show automatically under every tweet that has any (replyCount > 0), with no tap needed: \"replies appear directly under that tweet\". The API has no batch endpoint, so that is one GET /replies per tweet with replies. That is fine for v1, but worth knowing.\n2. Replies are list items inside their tweet's card (ul \"Replies\"), not separate timeline entries or nested articles. They show author, handle, time, text and images, without like/retweet/reply buttons: replies are single-level, and the like/retweet stories are about timeline tweets.\n3. The composer opens inline from the Reply button and takes focus. \"Post reply\" is disabled while the trimmed text is empty, so spaces and new lines alone can't be posted. Ctrl/Cmd+Enter also posts and is blocked when empty. The text is trimmed before posting.\n4. maxLength 280 on the reply box, matching the API. The PRD's open question on tweet length is unchanged; no counter is shown.\n5. Posting is not optimistic: the reply shows once the API saves it, and the composer closes. A failure leaves the text in place and shows a toast: \"Couldn't post your reply. Try again.\" (NF1 names likes, retweets and new posts, not replies.)\n6. No @xbot handling: no story in this epic asks for it.\n7. The spec runs on the saved sign-in. Each test posts fresh tweets and replies as you, marked \"XC-12 test\". The API can't delete them, so each run leaves about 4 tweets and 3 replies on your account.\n\n**For the reviewer:** decision 1 (automatic per-tweet reply fetches) and the cache handling in use-post-reply.ts."
        },
        {
          "author": "Claude",
          "role": "AI Review",
          "created": "2026-11-18T13:17",
          "body": "Review: APPROVE (docs/reviews/xc-12-review.md, change set e888a77..ed472aa). No blocking findings.\nNon-blocking:\n- components/tweet-card.tsx:38: one GET /replies per tweet that has replies, on each timeline load. Fine for now (NF7 is not known yet); fetching on scroll-into-view is an option later.\n- e2e/xc-12.spec.ts:126-131: the no-POST check comes right after the keypresses. expect.poll or a short wait would make it airtight (the API check mostly covers it).\n- e2e/xc-12.spec.ts: no phone-width step (NF2). Coverage gap only.\n- components/tweet-replies.tsx:90: replies are not optimistic. Acceptable, since NF1 names likes, retweets and new posts."
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:18",
          "body": "AC1 — I can write a reply to a tweet from the timeline: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-12/ac1.webm",
              "label": "AC1",
              "ac": 1,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:19",
          "body": "AC2 — Replies appear directly under that tweet in the timeline, without opening a separate page: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-12/ac2.webm",
              "label": "AC2",
              "ac": 2,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:19",
          "body": "AC3 — I cannot post an empty reply: pass",
          "attachments": [
            {
              "type": "video",
              "path": "docs/qa/XC-12/ac3.webm",
              "label": "AC3",
              "ac": 3,
              "result": "pass"
            }
          ]
        },
        {
          "author": "Claude",
          "role": "AI QA",
          "created": "2026-11-18T13:19",
          "body": "QA evidence: all 3 criteria pass.\n- AC1 — I can write a reply to a tweet from the timeline: pass\n- AC2 — Replies appear directly under that tweet in the timeline, without opening a separate page: pass\n- AC3 — I cannot post an empty reply: pass\n\nRe-run the evidence: `pnpm e2e:evidence e2e/xc-12.spec.ts` (from src/frontend). Moving to In Acceptance for a person to watch and decide."
        },
        {
          "author": "karcsi",
          "role": "PO",
          "created": "2026-11-18T13:34",
          "body": "PO karcsi: In Acceptance → Done"
        }
      ]
    },
    {
      "key": "XC-13",
      "type": "Story",
      "title": "Switch between light and dark mode",
      "description": "As a user, I want to use the app in light or dark mode, so that it is comfortable to read in any setting.\n\nSource: docs/stories/x-clone-v3-epic-4-stories.md#story-41-switch-between-light-and-dark-mode",
      "acceptanceCriteria": [
        "I can choose between light mode and dark mode.",
        "Every screen looks polished in both modes, with text and images easy to read.",
        "The app remembers my choice the next time I open it."
      ],
      "parent": "XC-4",
      "status": "New",
      "source": "docs/stories/x-clone-v3-epic-4-stories.md#story-41-switch-between-light-and-dark-mode",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
    },
    {
      "key": "XC-14",
      "type": "Story",
      "title": "Use the app on desktop and mobile browsers",
      "description": "As a user, I want the app to work on both my laptop and my phone's browser, so that I can use it wherever I am.\n\nSource: docs/stories/x-clone-v3-epic-4-stories.md#story-42-use-the-app-on-desktop-and-mobile-browsers",
      "acceptanceCriteria": [
        "All the app's screens and actions work in desktop and mobile browsers.",
        "On a phone-sized screen, nothing is cut off and I can use it without zooming."
      ],
      "parent": "XC-4",
      "status": "New",
      "source": "docs/stories/x-clone-v3-epic-4-stories.md#story-42-use-the-app-on-desktop-and-mobile-browsers",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
    }
  ]
};
