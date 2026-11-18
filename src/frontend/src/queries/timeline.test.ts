import { describe, expect, it } from "vitest"

import {
  TIMELINE_PAGE_SIZE,
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
