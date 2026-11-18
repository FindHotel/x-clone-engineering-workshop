import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useLikeTweet, withLiked } from "@/hooks/use-like-tweet"
import { timelineQueryOptions, type TimelinePage, type Tweet } from "@/queries/timeline"
import { setTweetLiked } from "@/queries/tweets"

vi.mock("@/queries/tweets", () => ({ setTweetLiked: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))

const tweet = { id: "t1", likeCount: 2, likedByMe: false } as Tweet

describe("withLiked", () => {
  it("adds one when liking and takes one away when unliking", () => {
    expect(withLiked(tweet, true)).toMatchObject({ likedByMe: true, likeCount: 3 })
    expect(withLiked({ ...tweet, likedByMe: true }, false)).toMatchObject({
      likedByMe: false,
      likeCount: 1,
    })
  })

  it("changes nothing when the tweet is already in that state", () => {
    expect(withLiked(tweet, false)).toBe(tweet)
  })

  it("never goes below zero", () => {
    expect(withLiked({ ...tweet, likeCount: 0, likedByMe: true }, false).likeCount).toBe(0)
  })
})

describe("useLikeTweet", () => {
  let queryClient: QueryClient
  const cached = () =>
    queryClient.getQueryData<InfiniteData<TimelinePage, string | null>>(
      timelineQueryOptions.queryKey
    )?.pages[0].items[0]
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient()
    queryClient.setQueryData(timelineQueryOptions.queryKey, {
      pages: [{ items: [tweet], nextCursor: null }],
      pageParams: [null],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("shows the like at once, then takes the server's count", async () => {
    let answer: (value: { likeCount: number }) => void = () => {}
    vi.mocked(setTweetLiked).mockReturnValue(new Promise((resolve) => (answer = resolve)))
    const { result } = renderHook(() => useLikeTweet("t1"), { wrapper })

    act(() => {
      result.current.mutate(true)
    })
    await waitFor(() => {
      expect(cached()).toMatchObject({ likedByMe: true, likeCount: 3 })
    })

    act(() => {
      answer({ likeCount: 5 })
    })
    await waitFor(() => {
      expect(cached()).toMatchObject({ likedByMe: true, likeCount: 5 })
    })
  })

  it("goes back and shows a message when saving fails", async () => {
    vi.mocked(setTweetLiked).mockRejectedValue(new Error("500"))
    const { result } = renderHook(() => useLikeTweet("t1"), { wrapper })

    act(() => {
      result.current.mutate(true)
    })
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Couldn't save your like. Try again.")
    })
    expect(cached()).toMatchObject({ likedByMe: false, likeCount: 2 })
  })
})
