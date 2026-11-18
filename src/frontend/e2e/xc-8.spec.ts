import { request as apiRequest, type APIRequestContext, type Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-8: Scroll the home timeline.
//
// The PO settled AC1 on the board (2026-11-18, option 1): "all users" means what the API's
// GET /api/timeline returns, the reader's own tweets plus those of the accounts they follow.
//
// The timeline depends on who you are and whom you follow, so every test signs up throwaway
// accounts of its own and puts their session cookie in this test's browser context only. The
// saved sign-in (and the person's own account) is never used or changed.

const PASSWORD = "correct-horse-42"
const BASE_URL = "http://localhost:5173"

// The smallest valid PNG (1x1, transparent): the API sniffs the bytes, not the file name.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
)

type Account = { api: APIRequestContext; id: string; name: string; handle: string }
type Tweet = { id: string; content: string; mediaUrls: string[]; createdAt: string }

const accounts: APIRequestContext[] = []

test.afterEach(async () => {
  await Promise.all(accounts.splice(0).map((api) => api.dispose()))
})

async function signUp(label: string, name: string): Promise<Account> {
  const api = await apiRequest.newContext({
    baseURL: BASE_URL,
    // better-auth rejects sign-up without an Origin, as a browser would send.
    extraHTTPHeaders: { Origin: BASE_URL },
  })
  accounts.push(api)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const res = await api.post("/api/auth/sign-up/email", {
    data: { email: `xc8-${label}-${id}@example.com`, password: PASSWORD, name },
  })
  expect(res.ok(), await res.text()).toBe(true)
  const { user } = (await res.json()) as { user: { id: string; name: string; handle: string } }
  return { api, id: user.id, name: user.name, handle: user.handle }
}

async function post(account: Account, content: string, mediaKeys?: string[]): Promise<Tweet> {
  const res = await account.api.post("/api/tweets", { data: { content, mediaKeys } })
  expect(res.ok(), await res.text()).toBe(true)
  return (await res.json()) as Tweet
}

async function uploadImage(account: Account): Promise<string> {
  const res = await account.api.post("/api/upload", {
    multipart: { files: { name: "dot.png", mimeType: "image/png", buffer: PNG_1X1 } },
  })
  expect(res.ok(), await res.text()).toBe(true)
  const { keys } = (await res.json()) as { keys: string[] }
  return keys[0]
}

// Signs this test's browser in as `account`, by its session cookie.
async function useAccount(page: Page, account: Account) {
  const { cookies } = await account.api.storageState()
  await page.context().clearCookies()
  await page.context().addCookies(cookies)
}

const tweets = (page: Page) => page.getByRole("main").getByRole("article")
const unique = (text: string) => `${text} ${Math.random().toString(36).slice(2, 8)}`

test("AC1: the home timeline shows tweets from all users, newest first", async ({
  page,
  evidence,
}) => {
  const reader = await signUp("reader", "XC8 Reader")
  const friend = await signUp("friend", "XC8 Friend")

  const oldest = unique("Friend's first tweet")
  const middle = unique("My own tweet")
  const newest = unique("Friend's second tweet")
  await evidence.step("Two people post, taking turns; one follows the other", async () => {
    await post(friend, oldest)
    await post(reader, middle)
    await post(friend, newest)
    const res = await reader.api.post(`/api/follows/${friend.id}`)
    expect(res.ok(), await res.text()).toBe(true)
  })
  await evidence.step("Open the home timeline", async () => {
    await useAccount(page, reader)
    await page.goto("/")
  })
  await evidence.step("Both people's tweets are there, newest first", async () => {
    await expect(tweets(page)).toHaveCount(3)
    await expect(tweets(page).nth(0)).toContainText(newest)
    await expect(tweets(page).nth(0)).toContainText(friend.name)
    await expect(tweets(page).nth(1)).toContainText(middle)
    await expect(tweets(page).nth(1)).toContainText(reader.name)
    await expect(tweets(page).nth(2)).toContainText(oldest)
    await expect(tweets(page).nth(2)).toContainText(friend.name)
  })
})

test("AC2: more tweets load automatically as I scroll, with no next-page button", async ({
  page,
  evidence,
}) => {
  test.setTimeout(120_000)
  const reader = await signUp("scroller", "XC8 Scroller")
  const total = 25 // more than one page (the app loads 20 at a time)

  await evidence.step(`Post ${total.toString()} tweets`, async () => {
    for (let i = 1; i <= total; i++) await post(reader, `Tweet number ${i.toString()}`)
  })
  await evidence.step("Open the home timeline: the first page shows", async () => {
    await useAccount(page, reader)
    await page.goto("/")
    await expect(tweets(page).first()).toContainText(`Tweet number ${total.toString()}`)
    await expect(tweets(page)).toHaveCount(20)
  })
  await evidence.step("There is no next-page or load-more button", async () => {
    await expect(page.getByRole("button", { name: /next|more|older|page/i })).toHaveCount(0)
    await expect(page.getByRole("link", { name: /next|more|older|page/i })).toHaveCount(0)
  })
  await evidence.step("Scroll down: the older tweets load by themselves", async () => {
    await tweets(page).last().scrollIntoViewIfNeeded()
    await page.mouse.wheel(0, 5000)
    await expect(tweets(page)).toHaveCount(total)
    await expect(tweets(page).last()).toContainText(/Tweet number 1$/)
  })
})

test("AC3: each tweet shows the author's name and handle, the time, the text and any image", async ({
  page,
  evidence,
}) => {
  const author = await signUp("author", "XC8 Author")
  const withImage = unique("A tweet with a picture")
  const textOnly = unique("A tweet with only words")
  let imageTweet: Tweet | undefined

  await evidence.step("Post a tweet with an image, then one without", async () => {
    imageTweet = await post(author, withImage, [await uploadImage(author)])
    await post(author, textOnly)
  })
  await evidence.step("Open the home timeline", async () => {
    await useAccount(page, author)
    await page.goto("/")
    await expect(tweets(page)).toHaveCount(2)
  })
  await evidence.step("The tweet shows name, handle, time, text and image", async () => {
    const tweet = tweets(page).filter({ hasText: withImage })
    await expect(tweet.getByText(author.name, { exact: true })).toBeVisible()
    await expect(tweet.getByText(`@${author.handle}`, { exact: true })).toBeVisible()
    const time = tweet.locator("time")
    await expect(time).toBeVisible()
    await expect(time).toHaveAttribute("datetime", imageTweet?.createdAt ?? "")
    await expect(time).toHaveText(/^\d+[smhd]$|[A-Za-z]/)
    await expect(tweet.getByText(withImage, { exact: true })).toBeVisible()
    const image = tweet.getByRole("img")
    await expect(image).toBeVisible()
    await expect(image).toHaveAttribute("src", imageTweet?.mediaUrls[0] ?? "")
    expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  })
  await evidence.step("The tweet without an image shows no image", async () => {
    const tweet = tweets(page).filter({ hasText: textOnly })
    await expect(tweet.getByText(`@${author.handle}`, { exact: true })).toBeVisible()
    await expect(tweet.locator("time")).toBeVisible()
    await expect(tweet.getByRole("img")).toHaveCount(0)
  })
})

test("AC4: with no tweets yet I see a simple empty message", async ({ page, evidence }) => {
  const newcomer = await signUp("newcomer", "XC8 Newcomer")

  await evidence.step("Open the home timeline as someone with no tweets yet", async () => {
    await useAccount(page, newcomer)
    await page.goto("/")
  })
  await evidence.step("A simple message says there are no tweets yet", async () => {
    await expect(page.getByText("No tweets yet")).toBeVisible()
    await expect(tweets(page)).toHaveCount(0)
  })
})
