import { afterEach, describe, expect, it, vi } from "vitest"

import { setTweetLiked, setTweetRetweeted } from "@/queries/tweets"

const respond = (status: number, body: unknown) =>
  vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("setTweetLiked", () => {
  it("likes with POST and unlikes with DELETE, sending the session cookie", async () => {
    const fetch = respond(200, { likeCount: 4 })
    vi.stubGlobal("fetch", fetch)

    await expect(setTweetLiked("t1", true)).resolves.toEqual({ likeCount: 4 })
    await setTweetLiked("t1", false)

    expect(fetch).toHaveBeenNthCalledWith(1, "/api/tweets/t1/like", {
      method: "POST",
      credentials: "include",
    })
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/tweets/t1/like", {
      method: "DELETE",
      credentials: "include",
    })
  })

  it("fails when the API does", async () => {
    vi.stubGlobal("fetch", respond(500, { error: "boom" }))
    await expect(setTweetLiked("t1", true)).rejects.toThrow("500")
  })
})

describe("setTweetRetweeted", () => {
  it("retweets with POST and undoes with DELETE, sending the session cookie", async () => {
    const fetch = respond(200, { retweetCount: 2 })
    vi.stubGlobal("fetch", fetch)

    await expect(setTweetRetweeted("t1", true)).resolves.toEqual({ retweetCount: 2 })
    await setTweetRetweeted("t1", false)

    expect(fetch).toHaveBeenNthCalledWith(1, "/api/tweets/t1/retweet", {
      method: "POST",
      credentials: "include",
    })
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/tweets/t1/retweet", {
      method: "DELETE",
      credentials: "include",
    })
  })

  it("fails when the API does", async () => {
    vi.stubGlobal("fetch", respond(503, { error: "down" }))
    await expect(setTweetRetweeted("t1", false)).rejects.toThrow("503")
  })
})
