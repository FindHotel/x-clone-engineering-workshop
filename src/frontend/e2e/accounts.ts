import { request as apiRequest, type APIRequestContext, type Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// Throwaway accounts for specs that change per-account state (likes, retweets, replies).
// Each one is signed up through the API and only its session cookie is put in the test's
// browser context, so the saved sign-in (and the person's own account) is never used or changed.
// Contexts are disposed after every test of a spec that imports this module.

const PASSWORD = "correct-horse-42"
const BASE_URL = "http://localhost:5173"

export type Account = { api: APIRequestContext; id: string; name: string; handle: string }
export type ApiTweet = {
  id: string
  content: string
  likeCount: number
  likedByMe: boolean
  retweetCount: number
  retweetedByMe: boolean
}

const contexts: APIRequestContext[] = []

test.afterEach(async () => {
  await Promise.all(contexts.splice(0).map((api) => api.dispose()))
})

export async function signUp(prefix: string, name: string): Promise<Account> {
  const api = await apiRequest.newContext({
    baseURL: BASE_URL,
    // better-auth rejects sign-up without an Origin, as a browser would send.
    extraHTTPHeaders: { Origin: BASE_URL },
  })
  contexts.push(api)
  const id = `${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`
  const res = await api.post("/api/auth/sign-up/email", {
    data: { email: `${prefix}-${id}@example.com`, password: PASSWORD, name },
  })
  expect(res.ok(), await res.text()).toBe(true)
  const { user } = (await res.json()) as { user: { id: string; name: string; handle: string } }
  return { api, id: user.id, name: user.name, handle: user.handle }
}

export async function post(account: Account, content: string): Promise<ApiTweet> {
  const res = await account.api.post("/api/tweets", { data: { content } })
  expect(res.ok(), await res.text()).toBe(true)
  return (await res.json()) as ApiTweet
}

export async function follow(follower: Account, followee: Account) {
  const res = await follower.api.post(`/api/follows/${followee.id}`)
  expect(res.ok(), await res.text()).toBe(true)
}

/** The tweet as `account` sees it on its timeline, straight from the API. */
export async function fetchTweet(account: Account, tweetId: string): Promise<ApiTweet> {
  const res = await account.api.get("/api/timeline?limit=50")
  expect(res.ok(), await res.text()).toBe(true)
  const { items } = (await res.json()) as { items: ApiTweet[] }
  const tweet = items.find((t) => t.id === tweetId)
  expect(tweet, `tweet ${tweetId} on the timeline`).toBeDefined()
  return tweet as ApiTweet
}

/** Signs this test's browser in as `account`, by its session cookie. */
export async function signInAs(page: Page, account: Account) {
  const { cookies } = await account.api.storageState()
  await page.context().clearCookies()
  await page.context().addCookies(cookies)
}

export const unique = (text: string) => `${text} ${Math.random().toString(36).slice(2, 8)}`
