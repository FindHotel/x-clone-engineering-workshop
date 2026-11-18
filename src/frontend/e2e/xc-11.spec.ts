import type { APIRequestContext, Locator, Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-11: Retweet and undo a retweet.
//
// Runs on the saved sign-in (your own account). Every test posts a fresh tweet of its own, so
// its retweet count starts at 0 and nobody else's tweets are touched; after each test the retweet
// is undone. `page.request` shares the browser's cookies, so API calls run as you too.

const RETWEET_URL = /\/api\/tweets\/[^/]+\/retweet$/

type ApiTweet = { id: string; retweetCount: number; retweetedByMe: boolean }

const posted: { api: APIRequestContext; id: string }[] = []

test.afterEach(async () => {
  for (const { api, id } of posted.splice(0)) await api.delete(`/api/tweets/${id}/retweet`)
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
  return card.getByRole("button", { name: /^retweet/i })
}

/** The retweet button shows `count`: as its number (none at zero, as on X) and in its label. */
async function expectRetweets(button: Locator, count: number, options?: { timeout: number }) {
  await expect(button).toHaveAccessibleName(
    `Retweet, ${count.toString()} ${count === 1 ? "retweet" : "retweets"}`,
    options
  )
  await expect(button).toHaveText(count === 0 ? "" : count.toString(), options)
}

const unique = (text: string) => `${text} ${Math.random().toString(36).slice(2, 8)}`

test("AC1: tapping retweet once retweets the tweet; tapping again undoes it", async ({
  page,
  evidence,
}) => {
  const text = unique("XC-11 test: a tweet worth sharing")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))

  const retweet = await evidence.step("Open the home timeline", () => openTimeline(page, text))
  await expect(retweet).toHaveAttribute("aria-pressed", "false")
  await expectRetweets(retweet, 0)

  await evidence.step("Tap retweet once: the tweet is retweeted", async () => {
    const saved = page.waitForResponse(
      (r) => RETWEET_URL.test(r.url()) && r.request().method() === "POST"
    )
    await retweet.click()
    expect((await saved).ok()).toBe(true)
    await expect(retweet).toHaveAttribute("aria-pressed", "true")
    await expectRetweets(retweet, 1)
  })
  await evidence.step("The retweet is saved", async () => {
    const saved = await savedTweet(page, tweet.id)
    expect(saved.retweetedByMe).toBe(true)
    expect(saved.retweetCount).toBe(1)
  })

  await evidence.step("Tap retweet again: the retweet is undone", async () => {
    const saved = page.waitForResponse(
      (r) => RETWEET_URL.test(r.url()) && r.request().method() === "DELETE"
    )
    await retweet.click()
    expect((await saved).ok()).toBe(true)
    await expect(retweet).toHaveAttribute("aria-pressed", "false")
    await expectRetweets(retweet, 0)
  })
  await evidence.step("The retweet is gone after a reload too", async () => {
    const saved = await savedTweet(page, tweet.id)
    expect(saved.retweetedByMe).toBe(false)
    expect(saved.retweetCount).toBe(0)
    const reloaded = await openTimeline(page, text)
    await expect(reloaded).toHaveAttribute("aria-pressed", "false")
    await expectRetweets(reloaded, 0)
  })
})

test("AC2: the retweet count and button update immediately, even on a slow connection", async ({
  page,
  evidence,
}) => {
  const text = unique("XC-11 test: retweeted on a slow connection")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))
  // A slow connection: every retweet request from the page takes 4 seconds to reach the API.
  const DELAY = 4_000
  await page.route(RETWEET_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, DELAY))
    await route.continue()
  })

  const retweet = await evidence.step("Open the home timeline on a slow connection", () =>
    openTimeline(page, text)
  )

  await evidence.step(
    "Tap retweet: count and button change at once, before the server answers",
    async () => {
      const answered = page.waitForResponse(RETWEET_URL)
      let done = false
      void answered.then(() => (done = true))
      await retweet.click()
      await expect(retweet).toHaveAttribute("aria-pressed", "true", { timeout: 500 })
      await expectRetweets(retweet, 1, { timeout: 500 })
      expect(done, "the server had not answered yet").toBe(false)
      await answered
    }
  )

  await evidence.step("Tap again: it is undone at once as well", async () => {
    const answered = page.waitForResponse(RETWEET_URL)
    let done = false
    void answered.then(() => (done = true))
    await retweet.click()
    await expect(retweet).toHaveAttribute("aria-pressed", "false", { timeout: 500 })
    await expectRetweets(retweet, 0, { timeout: 500 })
    expect(done, "the server had not answered yet").toBe(false)
    await answered
  })

  await evidence.step("Once the server answers, the retweet stays undone", async () => {
    await expect(retweet).toHaveAttribute("aria-pressed", "false")
    await expectRetweets(retweet, 0)
    const saved = await savedTweet(page, tweet.id)
    expect(saved.retweetedByMe).toBe(false)
  })
})

test("AC3: if saving my retweet fails, the count goes back and I see a message", async ({
  page,
  evidence,
}) => {
  const text = unique("XC-11 test: a retweet that fails to save")
  const tweet = await evidence.step("Post a new tweet", () => postTweet(page, text))
  // The API refuses every retweet and undo from the page, after a moment so the optimistic
  // change is visible first. (page.request calls are not routed: they reach the real API.)
  await page.route(RETWEET_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    await route.fulfill({ status: 500, json: { error: "Something went wrong" } })
  })

  const retweet = await evidence.step("Open the home timeline while saving retweets fails", () =>
    openTimeline(page, text)
  )

  await evidence.step("Tap retweet: it shows as retweeted straight away", async () => {
    await retweet.click()
    await expect(retweet).toHaveAttribute("aria-pressed", "true")
    await expectRetweets(retweet, 1)
  })

  await evidence.step("Saving fails: the count goes back and a message says so", async () => {
    await expect(page.getByText("Couldn't retweet. Try again.")).toBeVisible()
    await expect(retweet).toHaveAttribute("aria-pressed", "false")
    await expectRetweets(retweet, 0)
    const saved = await savedTweet(page, tweet.id)
    expect(saved.retweetedByMe).toBe(false)
    expect(saved.retweetCount).toBe(0)
  })

  const retweeted = await evidence.step("Retweet it for real, then open the timeline again", async () => {
    const res = await page.request.post(`/api/tweets/${tweet.id}/retweet`)
    expect(res.ok(), await res.text()).toBe(true)
    const button = await openTimeline(page, text)
    await expect(button).toHaveAttribute("aria-pressed", "true")
    await expectRetweets(button, 1)
    return button
  })

  await evidence.step("Tap to undo the retweet: it shows as undone straight away", async () => {
    await retweeted.click()
    await expect(retweeted).toHaveAttribute("aria-pressed", "false")
    await expectRetweets(retweeted, 0)
  })

  await evidence.step("Undoing fails: the retweet comes back and a message says so", async () => {
    await expect(page.getByText("Couldn't undo the retweet. Try again.")).toBeVisible()
    await expect(retweeted).toHaveAttribute("aria-pressed", "true")
    await expectRetweets(retweeted, 1)
    const saved = await savedTweet(page, tweet.id)
    expect(saved.retweetedByMe).toBe(true)
    expect(saved.retweetCount).toBe(1)
  })
})
