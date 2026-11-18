import { queryOptions } from "@tanstack/react-query"

import type { Tweet } from "@/queries/timeline"

/** The longest reply the API takes, after trimming. */
export const REPLY_MAX_LENGTH = 280

/** A tweet's single-level replies, oldest first. */
export const repliesQueryOptions = (tweetId: string) =>
  queryOptions({
    queryKey: ["replies", tweetId] as const,
    queryFn: async (): Promise<Tweet[]> => {
      const res = await fetch(`/api/tweets/${encodeURIComponent(tweetId)}/replies`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Couldn't load the replies (${res.status.toString()})`)
      return ((await res.json()) as { items: Tweet[] }).items
    },
  })

/** The text a reply would be posted with, or null when there's nothing to post. */
export function replyContent(draft: string): string | null {
  const content = draft.trim()
  return content ? content : null
}

/** Posts a reply to a top-level tweet and resolves to the new reply. */
export async function postReply(parentTweetId: string, content: string): Promise<Tweet> {
  const res = await fetch("/api/tweets", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, parentTweetId }),
  })
  if (!res.ok) throw new Error(`Couldn't post the reply (${res.status.toString()})`)
  return (await res.json()) as Tweet
}
