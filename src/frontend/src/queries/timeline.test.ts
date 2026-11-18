import { describe, expect, it } from "vitest"

import {
  TIMELINE_PAGE_SIZE,
  prependTimelineTweet,
  removeTimelineTweet,
  timelineQueryOptions,
  timelineUrl,
  updateTimelineTweet,
  type Tweet,
} from "@/queries/timeline"

describe("timelineUrl", () => {
  it("asks for the first page without a cursor", () => {
    expect(timelineUrl(null)).toBe(`/api/timeline?limit=${TIMELINE_PAGE_SIZE.toString()}`)
  })

  it("passes the cursor for later pages, encoded", () => {
    expect(timelineUrl("a+b/c=")).toBe(
      `/api/timeline?limit=${TIMELINE_PAGE_SIZE.toString()}&cursor=a%2Bb%2Fc%3D`
    )
  })
})

describe("timelineQueryOptions.getNextPageParam", () => {
  const next = (nextCursor: string | null) =>
    timelineQueryOptions.getNextPageParam({ items: [], nextCursor }, [], null, [null])

  it("continues from the page's cursor", () => {
    expect(next("abc")).toBe("abc")
  })

  it("stops once the API has no more pages", () => {
    expect(next(null)).toBeNull()
  })
})

describe("updateTimelineTweet", () => {
  const tweet = (id: string) => ({ id, likeCount: 0 }) as Tweet
  const data = {
    pages: [
      { items: [tweet("a"), tweet("b")], nextCursor: "c1" },
      { items: [tweet("c")], nextCursor: null },
    ],
    pageParams: [null, "c1"],
  }

  it("changes only the matching tweet, keeping the other pages and tweets as they were", () => {
    const next = updateTimelineTweet(data, "b", (t) => ({ ...t, likeCount: 7 }))

    expect(next?.pages[0].items[1].likeCount).toBe(7)
    expect(next?.pages[0].items[0]).toBe(data.pages[0].items[0])
    expect(next?.pages[1]).toBe(data.pages[1])
    expect(next?.pageParams).toBe(data.pageParams)
  })

  it("leaves an empty cache empty", () => {
    expect(updateTimelineTweet(undefined, "a", (t) => t)).toBeUndefined()
  })
})

describe("prependTimelineTweet", () => {
  const a = { id: "a" } as Tweet
  const b = { id: "b" } as Tweet
  const fresh = { id: "new" } as Tweet
  const data = {
    pages: [
      { items: [a], nextCursor: "c1" },
      { items: [b], nextCursor: null },
    ],
    pageParams: [null, "c1"],
  }

  it("puts the tweet at the very top, leaving later pages as they were", () => {
    const next = prependTimelineTweet(data, fresh)
    expect(next?.pages[0].items).toEqual([fresh, a])
    expect(next?.pages[0].nextCursor).toBe("c1")
    expect(next?.pages[1]).toBe(data.pages[1])
  })

  it("doesn't add a tweet that's already there", () => {
    expect(prependTimelineTweet(data, b)).toBe(data)
  })

  it("leaves an empty cache empty", () => {
    expect(prependTimelineTweet(undefined, fresh)).toBeUndefined()
  })
})

describe("removeTimelineTweet", () => {
  const a = { id: "a" } as Tweet
  const b = { id: "b" } as Tweet
  const data = {
    pages: [
      { items: [a, b], nextCursor: "c1" },
      { items: [{ id: "c" } as Tweet], nextCursor: null },
    ],
    pageParams: [null, "c1"],
  }

  it("takes out only that tweet, keeping the other pages as they were", () => {
    const next = removeTimelineTweet(data, "a")
    expect(next?.pages[0].items).toEqual([b])
    expect(next?.pages[1]).toBe(data.pages[1])
  })

  it("leaves an empty cache empty", () => {
    expect(removeTimelineTweet(undefined, "a")).toBeUndefined()
  })
})
