import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { isPendingTweet, usePostTweet } from "@/hooks/use-post-tweet"
import { sessionQueryOptions } from "@/lib/session"
import { timelineQueryOptions, type TimelinePage, type Tweet } from "@/queries/timeline"
import { postTweet, uploadImage } from "@/queries/tweets"

vi.mock("@/queries/tweets", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/queries/tweets")>()),
  postTweet: vi.fn(),
  uploadImage: vi.fn(),
}))

const older = { id: "t0", content: "older" } as Tweet
const saved = { id: "t1", content: "hello", mediaUrls: [] as string[] } as Tweet

describe("usePostTweet", () => {
  let queryClient: QueryClient
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const timeline = () =>
    queryClient.getQueryData<InfiniteData<TimelinePage, string | null>>(
      timelineQueryOptions.queryKey
    )?.pages[0].items

  beforeEach(() => {
    queryClient = new QueryClient()
    queryClient.setQueryData(timelineQueryOptions.queryKey, {
      pages: [{ items: [older], nextCursor: null }],
      pageParams: [null],
    })
    queryClient.setQueryData(sessionQueryOptions.queryKey, {
      user: { id: "u1", name: "Ada", handle: "ada" },
    } as never)
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => "blob:img")
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("puts the tweet on top at once, as me, and swaps in the saved one when the API answers", async () => {
    let answer: ((tweet: Tweet) => void) | undefined
    vi.mocked(postTweet).mockReturnValue(new Promise((resolve) => (answer = resolve)))
    const { result } = renderHook(() => usePostTweet(), { wrapper })

    act(() => {
      result.current.mutate({ content: "hello", image: null })
    })

    await waitFor(() => {
      expect(timeline()).toHaveLength(2)
    })
    const [pending] = timeline() ?? []
    expect(isPendingTweet(pending)).toBe(true)
    expect(pending).toMatchObject({ content: "hello", author: { name: "Ada", handle: "ada" } })
    expect(timeline()?.[1]).toBe(older)

    await act(async () => {
      answer?.(saved)
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(timeline()).toEqual([saved, older])
    })
    expect(postTweet).toHaveBeenCalledWith("hello", [])
    expect(uploadImage).not.toHaveBeenCalled()
  })

  it("uploads the image first and posts the tweet with its key", async () => {
    vi.mocked(uploadImage).mockResolvedValue("k1")
    vi.mocked(postTweet).mockResolvedValue(saved)
    const image = new File(["png"], "dot.png", { type: "image/png" })
    const { result } = renderHook(() => usePostTweet(), { wrapper })

    act(() => {
      result.current.mutate({ content: "hello", image })
    })

    await waitFor(() => {
      expect(timeline()).toEqual([saved, older])
    })
    expect(uploadImage).toHaveBeenCalledWith(image)
    expect(postTweet).toHaveBeenCalledWith("hello", ["k1"])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:img")
  })

  it("takes the tweet off the timeline again when posting fails", async () => {
    vi.mocked(postTweet).mockRejectedValue(new Error("500"))
    const { result } = renderHook(() => usePostTweet(), { wrapper })

    act(() => {
      result.current.mutate({ content: "hello", image: null })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(timeline()).toEqual([older])
  })
})
