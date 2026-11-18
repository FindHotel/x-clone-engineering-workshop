import { afterEach, describe, expect, it, vi } from "vitest"

import {
  IMAGE_MAX_BYTES,
  IMAGE_NOT_ALLOWED,
  TweetRejectedError,
  imageProblem,
  postTweet,
  setTweetLiked,
  setTweetRetweeted,
  tweetLengthProblem,
  uploadImage,
} from "@/queries/tweets"

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

describe("tweetLengthProblem", () => {
  it("is null up to 280 characters, not counting spaces around the text", () => {
    expect(tweetLengthProblem("a".repeat(280))).toBeNull()
    expect(tweetLengthProblem(`  ${"a".repeat(280)}\n`)).toBeNull()
  })

  it("says by how much a longer tweet is over the limit", () => {
    expect(tweetLengthProblem("a".repeat(281))).toBe(
      "Your tweet is 1 character too long. The limit is 280."
    )
    expect(tweetLengthProblem("a".repeat(290))).toBe(
      "Your tweet is 10 characters too long. The limit is 280."
    )
  })
})

describe("imageProblem", () => {
  it("takes JPEG, PNG, GIF and WebP images of up to 5 MB", () => {
    for (const type of ["image/jpeg", "image/png", "image/gif", "image/webp"]) {
      expect(imageProblem({ type, size: IMAGE_MAX_BYTES })).toBeNull()
    }
  })

  it("refuses other types and bigger files", () => {
    expect(imageProblem({ type: "image/svg+xml", size: 10 })).toBe(IMAGE_NOT_ALLOWED)
    expect(imageProblem({ type: "text/plain", size: 10 })).toBe(IMAGE_NOT_ALLOWED)
    expect(imageProblem({ type: "image/png", size: IMAGE_MAX_BYTES + 1 })).toBe(IMAGE_NOT_ALLOWED)
  })
})

describe("uploadImage", () => {
  const file = new File(["png"], "dot.png", { type: "image/png" })

  it("uploads the file with the session cookie and resolves to its media key", async () => {
    const fetch = respond(201, { keys: ["k1"] })
    vi.stubGlobal("fetch", fetch)

    await expect(uploadImage(file)).resolves.toBe("k1")

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("/api/upload")
    expect(init).toMatchObject({ method: "POST", credentials: "include" })
    expect((init.body as FormData).get("files")).toBeInstanceOf(File)
  })

  it("says the image isn't allowed when the API refuses it", async () => {
    for (const status of [400, 413]) {
      vi.stubGlobal("fetch", respond(status, { error: "nope" }))
      const upload = uploadImage(file)
      await expect(upload).rejects.toBeInstanceOf(TweetRejectedError)
      await expect(upload).rejects.toThrow(IMAGE_NOT_ALLOWED)
    }
  })

  it("fails plainly on other errors", async () => {
    vi.stubGlobal("fetch", respond(500, { error: "boom" }))
    await expect(uploadImage(file)).rejects.not.toBeInstanceOf(TweetRejectedError)
  })
})

describe("postTweet", () => {
  it("posts the text with the session cookie, and the media keys when there are any", async () => {
    const fetch = respond(201, { id: "t1" })
    vi.stubGlobal("fetch", fetch)

    await expect(postTweet("hello", [])).resolves.toEqual({ id: "t1" })
    await postTweet("", ["k1"])

    const init = { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } }
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/tweets", {
      ...init,
      body: JSON.stringify({ content: "hello" }),
    })
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/tweets", {
      ...init,
      body: JSON.stringify({ content: "", mediaKeys: ["k1"] }),
    })
  })

  it("fails when the API does", async () => {
    vi.stubGlobal("fetch", respond(400, { error: "too long" }))
    await expect(postTweet("x", [])).rejects.toBeInstanceOf(TweetRejectedError)
    vi.stubGlobal("fetch", respond(500, { error: "boom" }))
    await expect(postTweet("x", [])).rejects.toThrow("500")
  })
})
