import type { Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-12: Reply to a tweet inline.
//
// Runs on the saved sign-in (your own account). Every test posts a fresh tweet of its own and
// replies to that, so no one else's tweets are touched. `page.request` shares the browser's
// cookies, so API calls run as you too. (The API can't delete tweets: each run leaves its test
// tweets and replies on your account, marked "XC-12 test".)

type ApiTweet = { id: string; content: string; author: { handle: string } }

async function postTweet(page: Page, content: string, parentTweetId?: string): Promise<ApiTweet> {
  const res = await page.request.post("/api/tweets", { data: { content, parentTweetId } })
  expect(res.ok(), await res.text()).toBe(true)
  return (await res.json()) as ApiTweet
}

/** The tweet's replies as the API has them now, oldest first. */
async function savedReplies(page: Page, tweetId: string): Promise<ApiTweet[]> {
  const res = await page.request.get(`/api/tweets/${tweetId}/replies`)
  expect(res.ok(), await res.text()).toBe(true)
  return ((await res.json()) as { items: ApiTweet[] }).items
}

async function openTimeline(page: Page, text: string) {
  await page.goto("/")
  const card = page.getByRole("main").getByRole("article").filter({ hasText: text })
  await expect(card).toBeVisible()
  return card
}

const unique = (text: string) => `${text} ${Math.random().toString(36).slice(2, 8)}`

test("AC1: I can write a reply to a tweet from the timeline", async ({ page, evidence }) => {
  const text = unique("XC-12 test: a tweet to reply to")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))
  const card = await evidence.step("Open the home timeline", () => openTimeline(page, text))
  const reply = unique("XC-12 test: my reply")

  await evidence.step("Tap reply under the tweet: a reply box opens in place", async () => {
    await card.getByRole("button", { name: /^reply,/i }).click()
    await expect(card.getByRole("textbox", { name: "Your reply" })).toBeFocused()
  })
  await evidence.step("Write the reply and post it", async () => {
    await card.getByRole("textbox", { name: "Your reply" }).fill(reply)
    const saved = page.waitForResponse(
      (r) => r.url().endsWith("/api/tweets") && r.request().method() === "POST"
    )
    await card.getByRole("button", { name: "Post reply" }).click()
    expect((await saved).ok()).toBe(true)
  })
  await evidence.step("The reply is posted to that tweet, and I'm still on the timeline", async () => {
    await expect(card.getByRole("list", { name: "Replies" })).toContainText(reply)
    await expect(card.getByRole("textbox", { name: "Your reply" })).toHaveCount(0)
    await expect(card.getByRole("button", { name: /^reply,/i })).toHaveAccessibleName(
      "Reply, 1 reply"
    )
    await expect(page).toHaveURL("/")
    const replies = await savedReplies(page, tweet.id)
    expect(replies.map((r) => r.content)).toEqual([reply])
  })
})

test("AC2: replies appear directly under that tweet in the timeline, without opening a separate page", async ({
  page,
  evidence,
}) => {
  const above = unique("XC-12 test: the tweet below this one has replies")
  const text = unique("XC-12 test: a tweet with replies")
  const first = unique("XC-12 test: first reply")
  const second = unique("XC-12 test: second reply")

  await evidence.step("Post two tweets, and two replies to the older one", async () => {
    const tweet = await postTweet(page, text)
    await postTweet(page, first, tweet.id)
    await postTweet(page, second, tweet.id)
    await postTweet(page, above)
  })

  const card = await evidence.step("Open the home timeline", () => openTimeline(page, text))

  await evidence.step("The replies show right under their tweet, oldest first", async () => {
    const replies = card.getByRole("list", { name: "Replies" }).getByRole("listitem")
    await expect(replies).toHaveCount(2)
    await expect(replies.nth(0)).toContainText(first)
    await expect(replies.nth(1)).toContainText(second)
    // Under the tweet's own text, still inside its card.
    const tweetBox = await card.getByText(text, { exact: true }).boundingBox()
    const replyBox = await replies.nth(0).boundingBox()
    expect(replyBox?.y ?? 0).toBeGreaterThan((tweetBox?.y ?? 0) + (tweetBox?.height ?? 0) - 1)
  })

  await evidence.step("They belong to that tweet only, and no other page opened", async () => {
    const other = page.getByRole("main").getByRole("article").filter({ hasText: above })
    await expect(other).toBeVisible()
    await expect(other).not.toContainText(first)
    await expect(other.getByRole("list", { name: "Replies" })).toHaveCount(0)
    await expect(page).toHaveURL("/")
    // Replies are part of their tweet's card, not tweets of their own in the timeline.
    await expect(page.getByRole("main").getByRole("article").filter({ hasText: first })).toHaveCount(1)
  })
})

test("AC3: I cannot post an empty reply", async ({ page, evidence }) => {
  const text = unique("XC-12 test: nobody may reply with nothing")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))
  const card = await evidence.step("Open the home timeline", () => openTimeline(page, text))
  const posts: string[] = []
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().endsWith("/api/tweets")) posts.push(r.url())
  })

  const box = card.getByRole("textbox", { name: "Your reply" })
  const send = card.getByRole("button", { name: "Post reply" })

  await evidence.step("Open the reply box: with nothing written, it can't be posted", async () => {
    await card.getByRole("button", { name: /^reply,/i }).click()
    await expect(box).toHaveValue("")
    await expect(send).toBeDisabled()
  })
  await evidence.step("Only spaces and new lines: still can't be posted", async () => {
    await box.fill("   \n  ")
    await expect(send).toBeDisabled()
    await box.press("Control+Enter")
    await box.press("Meta+Enter")
  })
  await evidence.step("Nothing was sent and no reply appeared", async () => {
    await expect(card.getByRole("list", { name: "Replies" })).toHaveCount(0)
    expect(posts).toEqual([])
    expect(await savedReplies(page, tweet.id)).toEqual([])
  })
  await evidence.step("Once there's real text, it can be posted", async () => {
    await box.fill("XC-12 test: now with words")
    await expect(send).toBeEnabled()
  })
})
