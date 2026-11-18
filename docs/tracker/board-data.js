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
      "status": "In Progress",
      "source": "docs/epics/x-clone-v3-epics.md#epic-2-home-timeline-and-posting",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-18T12:10",
      "updates": 1
    },
    {
      "key": "XC-3",
      "type": "Epic",
      "title": "Likes, retweets and replies",
      "description": "Lets users react to other people's tweets with one-tap like and retweet (and one-tap undo), with counts that update immediately, and reply to a tweet with replies shown right under it in the timeline. Together these make up the \"react to others\" part of the core loop.\n\nCovers: R9 like, R10 retweet, R11 instant counts, R12 inline replies, NF1 responsiveness\n\nSource: docs/epics/x-clone-v3-epics.md#epic-3-likes-retweets-and-replies",
      "acceptanceCriteria": [],
      "parent": null,
      "status": "New",
      "source": "docs/epics/x-clone-v3-epics.md#epic-3-likes-retweets-and-replies",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
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
      "status": "New",
      "source": "docs/stories/x-clone-v3-epic-2-stories.md#story-22-post-a-tweet",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
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
      "status": "New",
      "source": "docs/stories/x-clone-v3-epic-3-stories.md#story-31-like-and-unlike-a-tweet",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
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
      "status": "New",
      "source": "docs/stories/x-clone-v3-epic-3-stories.md#story-32-retweet-and-undo-a-retweet",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
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
      "status": "New",
      "source": "docs/stories/x-clone-v3-epic-3-stories.md#story-33-reply-to-a-tweet-inline",
      "created": "2026-11-12T10:00",
      "updated": "2026-11-12T10:00",
      "updates": 0
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
