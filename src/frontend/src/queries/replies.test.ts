import { QueryClient } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"

import { postReply, repliesQueryOptions, replyContent } from "@/queries/replies"

const respond = (status: number, body: unknown) =>
  vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("replyContent", () => {
  it("is null for an empty draft or one with only spaces and new lines", () => {
    expect(replyContent("")).toBeNull()
    expect(replyContent("  \n\t ")).toBeNull()
  })

  it("is the trimmed text otherwise", () => {
    expect(replyContent("  hello there \n")).toBe("hello there")
  })
})

describe("repliesQueryOptions", () => {
  it("loads a tweet's replies with the session cookie", async () => {
    const fetch = respond(200, { items: [{ id: "r1" }] })
    vi.stubGlobal("fetch", fetch)

    const replies = await new QueryClient().fetchQuery(repliesQueryOptions("t1"))

    expect(replies).toEqual([{ id: "r1" }])
    expect(fetch).toHaveBeenCalledWith("/api/tweets/t1/replies", { credentials: "include" })
  })

  it("fails when the API does", async () => {
    vi.stubGlobal("fetch", respond(404, { error: "nope" }))
    await expect(new QueryClient().fetchQuery(repliesQueryOptions("t1"))).rejects.toThrow("404")
  })
})

describe("postReply", () => {
  it("posts the reply under its parent tweet, with the session cookie", async () => {
    const fetch = respond(201, { id: "r1", content: "hi" })
    vi.stubGlobal("fetch", fetch)

    await expect(postReply("t1", "hi")).resolves.toEqual({ id: "r1", content: "hi" })
    expect(fetch).toHaveBeenCalledWith("/api/tweets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "hi", parentTweetId: "t1" }),
    })
  })

  it("fails when the API does", async () => {
    vi.stubGlobal("fetch", respond(400, { error: "too long" }))
    await expect(postReply("t1", "hi")).rejects.toThrow("400")
  })
})
