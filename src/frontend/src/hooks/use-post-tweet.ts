import { useMutation, useQueryClient } from "@tanstack/react-query"

import { sessionQueryOptions } from "@/lib/session"
import {
  prependTimelineTweet,
  removeTimelineTweet,
  timelineQueryOptions,
  type Tweet,
} from "@/queries/timeline"
import { postTweet, uploadImage } from "@/queries/tweets"

export type NewTweet = { content: string; image: File | null }

const PENDING_PREFIX = "pending-"

/** True for a tweet that's on the timeline but not saved yet: it has no real id to act on. */
export function isPendingTweet(tweet: Tweet): boolean {
  return tweet.id.startsWith(PENDING_PREFIX)
}

/**
 * Posts a tweet, with its image if it has one. The tweet goes on top of the timeline at once and
 * is swapped for the saved one when the API answers; if posting fails, it's taken off again.
 */
export function usePostTweet() {
  const queryClient = useQueryClient()
  const { queryKey } = timelineQueryOptions

  return useMutation({
    mutationFn: async ({ content, image }: NewTweet) =>
      postTweet(content, image ? [await uploadImage(image)] : []),
    onMutate: async ({ content, image }) => {
      // A timeline fetch landing now would overwrite the new tweet.
      await queryClient.cancelQueries({ queryKey })
      const user = queryClient.getQueryData(sessionQueryOptions.queryKey)?.user
      const imageUrl = image ? URL.createObjectURL(image) : null
      const pending: Tweet = {
        id: `${PENDING_PREFIX}${crypto.randomUUID()}`,
        authorId: user?.id ?? "",
        author: { name: user?.name ?? "You", handle: user?.handle ?? "" },
        content,
        mediaUrls: imageUrl ? [imageUrl] : [],
        createdAt: new Date().toISOString(),
        likeCount: 0,
        retweetCount: 0,
        replyCount: 0,
        likedByMe: false,
        retweetedByMe: false,
      }
      queryClient.setQueryData(queryKey, (data) => prependTimelineTweet(data, pending))
      return { pendingId: pending.id, imageUrl }
    },
    onSuccess: (tweet, _newTweet, { pendingId }) => {
      if (!queryClient.getQueryData(queryKey)) {
        // The timeline isn't loaded: it will come with the new tweet in it.
        void queryClient.invalidateQueries({ queryKey })
        return
      }
      queryClient.setQueryData(queryKey, (data) =>
        prependTimelineTweet(removeTimelineTweet(data, pendingId), tweet)
      )
    },
    onError: (_error, _newTweet, context) => {
      if (!context) return
      queryClient.setQueryData(queryKey, (data) => removeTimelineTweet(data, context.pendingId))
    },
    onSettled: (_tweet, _error, _newTweet, context) => {
      if (context?.imageUrl) URL.revokeObjectURL(context.imageUrl)
    },
  })
}
