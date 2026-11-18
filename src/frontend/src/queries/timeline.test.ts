import { describe, expect, it } from "vitest"

import { TIMELINE_PAGE_SIZE, timelineQueryOptions, timelineUrl } from "@/queries/timeline"

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
