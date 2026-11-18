# X Clone PRD v3.1: Bookmarks (DRAFT)

> **Draft for the product owner. Not approved and not part of the backlog.**
> This proposes adding bookmarks after v1. It does not change `docs/prds/x-clone-v3-prd.md`,
> where bookmarks stay out of scope, and no epic, story or board ticket comes from it until the
> product owner adopts it.

*Builds on: docs/prds/x-clone-v3-prd.md*

## Problem

v1 lets people scroll, post and react, but not keep a tweet to come back to later. A like is
public and means "I like this", so it's a poor way to save something. Without a private way to
save tweets, people lose things they meant to read again, reply to or share.

## Goals

- Let a signed-in user save a tweet privately with one tap and find it again later.
- Keep the experience as lightweight as the rest of the app: one toggle, one list.
- Success metric: Not known yet (candidates: share of active users with at least one bookmark,
  visits to the bookmarks list per week).

## Requirements

*Numbered after v3's R1–R14 and N1 so the two documents never clash.*

### Must Have

- **R15.** A signed-in user can bookmark a tweet with one tap and remove the bookmark with one tap.
- **R16.** Each tweet shows whether the current user has bookmarked it.
- **R17.** Bookmarks are private: only the person who made them can see them, and other users
  see no bookmark count.
- **R18.** A signed-in user can open a Bookmarks page from the app's navigation, listing every
  tweet they've bookmarked, most recently bookmarked first.
- **R19.** The Bookmarks page loads more tweets automatically as the user scrolls, like the home
  timeline (R5).
- **R20.** Each tweet on the Bookmarks page looks and behaves the same as in the timeline (R6,
  R9–R12), including the bookmark toggle.
- **R21.** Removing a bookmark from the Bookmarks page takes the tweet off the list straight away.
- **R22.** A user with no bookmarks sees an empty state that explains how to bookmark a tweet.

### Nice to Have

- **N2.** A bookmarked tweet that its author later deletes disappears from the list, or shows as
  unavailable. (Which of the two is an open question.)

## Non-Functional Requirements

*v3's NF1–NF8 still apply. These are the changes and additions.*

- **NF1 (applies to bookmarks):** Bookmarking and removing a bookmark feel instant, even on a slow
  connection. If saving fails, the toggle goes back to how it was and the user sees a message.
- **NF5 (exception needed):** The existing API has **no bookmark endpoints**. Its published spec
  (`/api/openapi.json`, checked 2026-11-18) covers the timeline, tweets, likes, retweets, replies,
  follows, users, notifications, search and upload, and doesn't mention bookmarks. This feature
  therefore needs new backend work, which v3's NF5 rules out. It can't start until the backend
  provides:
  - a way to add and remove a bookmark on a tweet for the signed-in user;
  - a per-user "bookmarked by me" flag on every tweet the API returns (alongside the existing
    `likedByMe` and `retweetedByMe`);
  - a paginated list of the signed-in user's bookmarked tweets, newest bookmark first, in the same
    page shape as the timeline.
- **NF9. Privacy:** Bookmarks never show up in another user's view, in notifications or in any
  public count (see R17).

## Out of Scope

- Bookmark folders or collections
- Notes on a bookmark
- Sharing or exporting bookmarks
- Searching within bookmarks
- A public bookmark count on tweets

## Open Questions

- Is bookmarks worth a post-v1 release, and when? (v3's NF6 puts everything outside the Must
  Have list after v1.)
- Who builds the backend endpoints, and on what timeline?
- When the author deletes a bookmarked tweet: remove it from the list or show it as unavailable?
- Is there a limit on how many bookmarks one user can have? Not known yet.
- Where does the Bookmarks link go in the navigation on mobile? Not known yet.
- What is the success metric? Not known yet.
