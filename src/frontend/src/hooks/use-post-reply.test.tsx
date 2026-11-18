import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { usePostReply } from "@/hooks/use-post-reply"
import { postReply, repliesQueryOptions } from "@/queries/replies"
import { timelineQueryOptions, type TimelinePage, type Tweet } from "@/queries/timeline"

vi.mock("@/queries/replies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/queries/replies")>()),
  postReply: vi.fn(),
}))

const tweet = { id: "t1", replyCount: 1 } as Tweet
const older = { id: "r1", content: "first" } as Tweet
const reply = { id: "r2", content: "second" } as Tweet

describe("usePostReply", () => {
  let queryClient: QueryClient
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const replyCount = () =>
    queryClient.getQueryData<InfiniteData<TimelinePage, string | null>>(
      timelineQueryOptions.queryKey
    )?.pages[0].items[0].replyCount

  beforeEach(() => {
    queryClient = new QueryClient()
    queryClient.setQueryData(timelineQueryOptions.queryKey, {
      pages: [{ items: [tweet], nextCursor: null }],
      pageParams: [null],
    })
    vi.mocked(postReply).mockResolvedValue(reply)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("adds the reply after the ones already shown and counts it on the tweet", async () => {
    queryClient.setQueryData(repliesQueryOptions("t1").queryKey, [older])
    const { result } = renderHook(() => usePostReply("t1"), { wrapper })

    act(() => {
      result.current.mutate("second")
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(repliesQueryOptions("t1").queryKey)).toEqual([older, reply])
    })
    expect(postReply).toHaveBeenCalledWith("t1", "second")
    expect(replyCount()).toBe(2)
  })

  it("refetches the replies, rather than showing the new one alone, when none were loaded", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries")
    const { result } = renderHook(() => usePostReply("t1"), { wrapper })

    act(() => {
      result.current.mutate("second")
    })

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: repliesQueryOptions("t1").queryKey })
    })
    expect(queryClient.getQueryData(repliesQueryOptions("t1").queryKey)).toBeUndefined()
    expect(replyCount()).toBe(2)
  })
})
