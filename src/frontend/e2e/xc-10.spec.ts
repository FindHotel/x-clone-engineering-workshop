import type { Locator, Page } from "@playwright/test"

import { fetchTweet, follow, post, signUp, unique, signInAs, type Account } from "./accounts"
import { expect, test } from "./fixtures"

// XC-10: Like and unlike a tweet.
//
// Likes are per-account state shared live on the API, so every test signs up throwaway
// accounts: an author who posts, and a reader who follows them and does the liking.

const LIKE_URL = /\/api\/tweets\/[^/]+\/like$/

/** The like button shows `count`: as its number (none at zero, like X) and in its label. */
async function expectLikes(like: Locator, count: number, options?: { timeout: number }) {
  await expect(like).toHaveAccessibleName(
    `Like, ${count.toString()} ${count === 1 ? "like" : "likes"}`,
    options
  )
  await expect(like).toHaveText(count === 0 ? "" : count.toString(), options)
}

async function setUp(label: string) {
  const author = await signUp(`xc10-${label}-author`, "XC10 Author")
  const reader = await signUp(`xc10-${label}-reader`, "XC10 Reader")
  const text = unique("A tweet worth liking")
  const tweet = await post(author, text)
  await follow(reader, author)
  return { author, reader, text, tweet }
}

async function openTimeline(page: Page, reader: Account, text: string) {
  await signInAs(page, reader)
  await page.goto("/")
  const card = page.getByRole("main").getByRole("article").filter({ hasText: text })
  await expect(card).toBeVisible()
  return { card, like: card.getByRole("button", { name: /^like/i }) }
}

test("AC1: tapping like once likes the tweet; tapping again removes my like", async ({
  page,
  evidence,
}) => {
  const { reader, text, tweet } = await setUp("toggle")

  const { like } = await evidence.step("Open the home timeline", () =>
    openTimeline(page, reader, text)
  )
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
    const saved = await fetchTweet(reader, tweet.id)
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
    const saved = await fetchTweet(reader, tweet.id)
    expect(saved.likedByMe).toBe(false)
    expect(saved.likeCount).toBe(0)
    await page.reload()
    const { like: reloaded } = await openTimeline(page, reader, text)
    await expect(reloaded).toHaveAttribute("aria-pressed", "false")
    await expectLikes(reloaded, 0)
  })
})

test("AC2: the like count and button update immediately, even on a slow connection", async ({
  page,
  evidence,
}) => {
  const { reader, text, tweet } = await setUp("slow")
  // A slow connection: every like request takes 4 seconds to reach the API.
  const DELAY = 4_000
  await page.route(LIKE_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, DELAY))
    await route.continue()
  })

  const { like } = await evidence.step("Open the home timeline on a slow connection", () =>
    openTimeline(page, reader, text)
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
    const saved = await fetchTweet(reader, tweet.id)
    expect(saved.likedByMe).toBe(false)
  })
})

test("AC3: if saving my like fails, the count goes back and I see a message", async ({
  page,
  evidence,
}) => {
  const { reader, text, tweet } = await setUp("fail")
  // The API refuses to save the like, after a moment so the optimistic change is visible.
  await page.route(LIKE_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    await route.fulfill({ status: 500, json: { error: "Something went wrong" } })
  })

  const { like } = await evidence.step("Open the home timeline while saving likes fails", () =>
    openTimeline(page, reader, text)
  )

  await evidence.step("Tap like: it shows as liked straight away", async () => {
    await like.click()
    await expect(like).toHaveAttribute("aria-pressed", "true")
    await expectLikes(like, 1)
  })

  await evidence.step("Saving fails: the count goes back and a message says so", async () => {
    await expect(page.getByText(/couldn.t like/i)).toBeVisible()
    await expect(like).toHaveAttribute("aria-pressed", "false")
    await expectLikes(like, 0)
    const saved = await fetchTweet(reader, tweet.id)
    expect(saved.likedByMe).toBe(false)
    expect(saved.likeCount).toBe(0)
  })
})
