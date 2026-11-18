import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useRetweetTweet, withRetweeted } from "@/hooks/use-retweet-tweet"
import { timelineQueryOptions, type TimelinePage, type Tweet } from "@/queries/timeline"
import { setTweetRetweeted } from "@/queries/tweets"

vi.mock("@/queries/tweets", () => ({ setTweetRetweeted: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))

const tweet = { id: "t1", retweetCount: 4, retweetedByMe: true } as Tweet

describe("withRetweeted", () => {
  it("adds one when retweeting and takes one away when undoing", () => {
    expect(withRetweeted({ ...tweet, retweetedByMe: false }, true)).toMatchObject({
      retweetedByMe: true,
      retweetCount: 5,
    })
    expect(withRetweeted(tweet, false)).toMatchObject({ retweetedByMe: false, retweetCount: 3 })
  })

  it("changes nothing when the tweet is already in that state", () => {
    expect(withRetweeted(tweet, true)).toBe(tweet)
  })

  it("never goes below zero", () => {
    expect(withRetweeted({ ...tweet, retweetCount: 0 }, false).retweetCount).toBe(0)
  })
})

describe("useRetweetTweet", () => {
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

  it("shows the undo at once, then takes the server's count", async () => {
    let answer: (value: { retweetCount: number }) => void = () => {}
    vi.mocked(setTweetRetweeted).mockReturnValue(new Promise((resolve) => (answer = resolve)))
    const { result } = renderHook(() => useRetweetTweet("t1"), { wrapper })

    act(() => {
      result.current.mutate(false)
    })
    await waitFor(() => {
      expect(cached()).toMatchObject({ retweetedByMe: false, retweetCount: 3 })
    })

    act(() => {
      answer({ retweetCount: 6 })
    })
    await waitFor(() => {
      expect(cached()).toMatchObject({ retweetedByMe: false, retweetCount: 6 })
    })
  })

  it("goes back and shows a message when undoing fails", async () => {
    vi.mocked(setTweetRetweeted).mockRejectedValue(new Error("500"))
    const { result } = renderHook(() => useRetweetTweet("t1"), { wrapper })

    act(() => {
      result.current.mutate(false)
    })
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Couldn't undo the retweet. Try again.")
    })
    expect(cached()).toMatchObject({ retweetedByMe: true, retweetCount: 4 })
  })
})
