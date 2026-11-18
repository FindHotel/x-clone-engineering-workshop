import { infiniteQueryOptions, type InfiniteData } from "@tanstack/react-query"

export type Tweet = {
  id: string
  authorId: string
  author: { name: string; handle: string }
  content: string
  mediaUrls: string[]
  createdAt: string
  likeCount: number
  retweetCount: number
  replyCount: number
  likedByMe: boolean
  retweetedByMe: boolean
}

export type TimelinePage = {
  items: Tweet[]
  nextCursor: string | null
}

export const TIMELINE_PAGE_SIZE = 20

export function timelineUrl(cursor: string | null): string {
  const params = new URLSearchParams({ limit: TIMELINE_PAGE_SIZE.toString() })
  if (cursor) params.set("cursor", cursor)
  return `/api/timeline?${params.toString()}`
}

/**
 * The signed-in user's home timeline: their own tweets plus those of the
 * accounts they follow, newest first, a page at a time.
 */
export const timelineQueryOptions = infiniteQueryOptions({
  queryKey: ["timeline"] as const,
  queryFn: async ({ pageParam }): Promise<TimelinePage> => {
    const res = await fetch(timelineUrl(pageParam), { credentials: "include" })
    if (!res.ok) throw new Error(`Couldn't load the timeline (${res.status.toString()})`)
    return (await res.json()) as TimelinePage
  },
  initialPageParam: null as string | null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

/**
 * Returns the cached timeline with one tweet changed by `update`, leaving every other page and
 * tweet as they were (same references), so only that tweet's card re-renders.
 */
export function updateTimelineTweet<TPageParam>(
  data: InfiniteData<TimelinePage, TPageParam> | undefined,
  tweetId: string,
  update: (tweet: Tweet) => Tweet
): InfiniteData<TimelinePage, TPageParam> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) =>
      page.items.some((tweet) => tweet.id === tweetId)
        ? {
            ...page,
            items: page.items.map((tweet) => (tweet.id === tweetId ? update(tweet) : tweet)),
          }
        : page
    ),
  }
}

/** Returns the cached timeline with `tweet` at the very top, unless it's already in it. */
export function prependTimelineTweet<TPageParam>(
  data: InfiniteData<TimelinePage, TPageParam> | undefined,
  tweet: Tweet
): InfiniteData<TimelinePage, TPageParam> | undefined {
  if (!data || data.pages.length === 0) return data
  if (data.pages.some((page) => page.items.some((item) => item.id === tweet.id))) return data
  const [first, ...rest] = data.pages
  return { ...data, pages: [{ ...first, items: [tweet, ...first.items] }, ...rest] }
}

/** Returns the cached timeline without the tweet `tweetId`. */
export function removeTimelineTweet<TPageParam>(
  data: InfiniteData<TimelinePage, TPageParam> | undefined,
  tweetId: string
): InfiniteData<TimelinePage, TPageParam> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) =>
      page.items.some((tweet) => tweet.id === tweetId)
        ? { ...page, items: page.items.filter((tweet) => tweet.id !== tweetId) }
        : page
    ),
  }
}
