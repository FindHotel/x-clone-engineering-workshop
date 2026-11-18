import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { timelineQueryOptions, updateTimelineTweet, type Tweet } from "@/queries/timeline"
import { setTweetLiked } from "@/queries/tweets"

/** The tweet as it looks once `liked` is applied: the count moves by one only on a change. */
export function withLiked(tweet: Tweet, liked: boolean): Tweet {
  if (tweet.likedByMe === liked) return tweet
  return {
    ...tweet,
    likedByMe: liked,
    likeCount: Math.max(0, tweet.likeCount + (liked ? 1 : -1)),
  }
}

/**
 * Likes or unlikes a tweet on the timeline, optimistically: the card changes at once and the
 * request follows. If the request fails the card goes back and a toast says so.
 */
export function useLikeTweet(tweetId: string) {
  const queryClient = useQueryClient()
  const mutationKey = ["like", tweetId]
  const patch = (update: (tweet: Tweet) => Tweet) => {
    queryClient.setQueryData(timelineQueryOptions.queryKey, (data) =>
      updateTimelineTweet(data, tweetId, update)
    )
  }

  return useMutation({
    mutationKey,
    mutationFn: (liked: boolean) => setTweetLiked(tweetId, liked),
    onMutate: async (liked) => {
      // A timeline fetch landing now would overwrite the optimistic change.
      await queryClient.cancelQueries({ queryKey: timelineQueryOptions.queryKey })
      patch((tweet) => withLiked(tweet, liked))
    },
    onSuccess: ({ likeCount }) => {
      // Take the server's count, unless a later tap is still on its way: that one wins.
      if (queryClient.isMutating({ mutationKey }) > 1) return
      patch((tweet) => ({ ...tweet, likeCount }))
    },
    onError: (_error, liked) => {
      // Undo only this tap's change; if a later tap already changed the state, it stands.
      patch((tweet) => (tweet.likedByMe === liked ? withLiked(tweet, !liked) : tweet))
      toast.error(
        liked ? "Couldn't like the tweet. Try again." : "Couldn't remove your like. Try again."
      )
    },
  })
}
