import type { APIRequestContext, Locator, Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-10: Like and unlike a tweet.
//
// Runs on the saved sign-in (your own account). Every test posts a fresh tweet of its own, so
// its like count starts at 0 and nobody else's likes are touched; after each test the tweet is
// left unliked. `page.request` shares the browser's cookies, so API calls run as you too.

const LIKE_URL = /\/api\/tweets\/[^/]+\/like$/

type ApiTweet = { id: string; likeCount: number; likedByMe: boolean }

const posted: { api: APIRequestContext; id: string }[] = []

test.afterEach(async () => {
  for (const { api, id } of posted.splice(0)) await api.delete(`/api/tweets/${id}/like`)
})

async function postTweet(page: Page, content: string): Promise<ApiTweet> {
  const res = await page.request.post("/api/tweets", { data: { content } })
  expect(res.ok(), await res.text()).toBe(true)
  const tweet = (await res.json()) as ApiTweet
  posted.push({ api: page.request, id: tweet.id })
  return tweet
}

/** The tweet as the API has it now, read from your timeline. */
async function savedTweet(page: Page, tweetId: string): Promise<ApiTweet> {
  const res = await page.request.get("/api/timeline?limit=50")
  expect(res.ok(), await res.text()).toBe(true)
  const { items } = (await res.json()) as { items: ApiTweet[] }
  const tweet = items.find((t) => t.id === tweetId)
  expect(tweet, `tweet ${tweetId} on the timeline`).toBeDefined()
  return tweet as ApiTweet
}

async function openTimeline(page: Page, text: string) {
  await page.goto("/")
  const card = page.getByRole("main").getByRole("article").filter({ hasText: text })
  await expect(card).toBeVisible()
  return card.getByRole("button", { name: /^like/i })
}

/** The like button shows `count`: as its number (none at zero, like X) and in its label. */
async function expectLikes(like: Locator, count: number, options?: { timeout: number }) {
  await expect(like).toHaveAccessibleName(
    `Like, ${count.toString()} ${count === 1 ? "like" : "likes"}`,
    options
  )
  await expect(like).toHaveText(count === 0 ? "" : count.toString(), options)
}

const unique = (text: string) => `${text} ${Math.random().toString(36).slice(2, 8)}`

test("AC1: tapping like once likes the tweet; tapping again removes my like", async ({
  page,
  evidence,
}) => {
  const text = unique("XC-10 test: a tweet worth liking")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))

  const like = await evidence.step("Open the home timeline", () => openTimeline(page, text))
  await expect(like).toHaveAttribute("aria-pressed", "false")
  await expectLikes(like, 0)

  await evidence.step("Tap like once: the tweet is liked", async () => {
    const saved = page.waitForResponse((r) => LIKE_URL.test(r.url()) && r.request().method() === "POST")
    await like.click()
    expect((await saved).ok()).toBe(true)
    await expect(like).toHaveAttribute("aria-pressed", "true")
    await expectLikes(like, 1)
  })
  await evidence.step("The like is saved", async () => {
    const saved = await savedTweet(page, tweet.id)
    expect(saved.likedByMe).toBe(true)
    expect(saved.likeCount).toBe(1)
  })

  await evidence.step("Tap like again: my like is removed", async () => {
    const saved = page.waitForResponse((r) => LIKE_URL.test(r.url()) && r.request().method() === "DELETE")
    await like.click()
    expect((await saved).ok()).toBe(true)
    await expect(like).toHaveAttribute("aria-pressed", "false")
    await expectLikes(like, 0)
  })
  await evidence.step("The like is gone after a reload too", async () => {
    const saved = await savedTweet(page, tweet.id)
    expect(saved.likedByMe).toBe(false)
    expect(saved.likeCount).toBe(0)
    const reloaded = await openTimeline(page, text)
    await expect(reloaded).toHaveAttribute("aria-pressed", "false")
    await expectLikes(reloaded, 0)
  })
})

test("AC2: the like count and button update immediately, even on a slow connection", async ({
  page,
  evidence,
}) => {
  const text = unique("XC-10 test: liked on a slow connection")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))
  // A slow connection: every like request from the page takes 4 seconds to reach the API.
  const DELAY = 4_000
  await page.route(LIKE_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, DELAY))
    await route.continue()
  })

  const like = await evidence.step("Open the home timeline on a slow connection", () =>
    openTimeline(page, text)
  )

  await evidence.step("Tap like: count and button change at once, before the server answers", async () => {
    const answered = page.waitForResponse(LIKE_URL)
    let done = false
    void answered.then(() => (done = true))
    await like.click()
    await expect(like).toHaveAttribute("aria-pressed", "true", { timeout: 500 })
    await expectLikes(like, 1, { timeout: 500 })
    expect(done, "the server had not answered yet").toBe(false)
    await answered
  })

  await evidence.step("Tap again: it is undone at once as well", async () => {
    const answered = page.waitForResponse(LIKE_URL)
    let done = false
    void answered.then(() => (done = true))
    await like.click()
    await expect(like).toHaveAttribute("aria-pressed", "false", { timeout: 500 })
    await expectLikes(like, 0, { timeout: 500 })
    expect(done, "the server had not answered yet").toBe(false)
    await answered
  })

  await evidence.step("Once the server answers, the like stays undone", async () => {
    await expect(like).toHaveAttribute("aria-pressed", "false")
    await expectLikes(like, 0)
    const saved = await savedTweet(page, tweet.id)
    expect(saved.likedByMe).toBe(false)
  })
})

test("AC3: if saving my like fails, the count goes back and I see a message", async ({
  page,
  evidence,
}) => {
  const text = unique("XC-10 test: a like that fails to save")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))
  // The API refuses every like and unlike from the page, after a moment so the optimistic
  // change is visible first. (page.request calls are not routed: they reach the real API.)
  await page.route(LIKE_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    await route.fulfill({ status: 500, json: { error: "Something went wrong" } })
  })

  const like = await evidence.step("Open the home timeline while saving likes fails", () =>
    openTimeline(page, text)
  )

  await evidence.step("Tap like: it shows as liked straight away", async () => {
    await like.click()
    await expect(like).toHaveAttribute("aria-pressed", "true")
    await expectLikes(like, 1)
  })

  await evidence.step("Saving fails: the count goes back and a message says so", async () => {
    await expect(page.getByText("Couldn't save your like. Try again.")).toBeVisible()
    await expect(like).toHaveAttribute("aria-pressed", "false")
    await expectLikes(like, 0)
    const saved = await savedTweet(page, tweet.id)
    expect(saved.likedByMe).toBe(false)
    expect(saved.likeCount).toBe(0)
  })

  const liked = await evidence.step("Like it for real, then open the timeline again", async () => {
    const res = await page.request.post(`/api/tweets/${tweet.id}/like`)
    expect(res.ok(), await res.text()).toBe(true)
    const button = await openTimeline(page, text)
    await expect(button).toHaveAttribute("aria-pressed", "true")
    await expectLikes(button, 1)
    return button
  })

  await evidence.step("Tap to remove the like: it shows as removed straight away", async () => {
    await liked.click()
    await expect(liked).toHaveAttribute("aria-pressed", "false")
    await expectLikes(liked, 0)
  })

  await evidence.step("Removing fails: the like comes back and a message says so", async () => {
    await expect(page.getByText("Couldn't remove your like. Try again.")).toBeVisible()
    await expect(liked).toHaveAttribute("aria-pressed", "true")
    await expectLikes(liked, 1)
    const saved = await savedTweet(page, tweet.id)
    expect(saved.likedByMe).toBe(true)
    expect(saved.likeCount).toBe(1)
  })
})
