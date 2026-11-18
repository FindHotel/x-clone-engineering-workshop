import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { timelineQueryOptions, updateTimelineTweet, type Tweet } from "@/queries/timeline"

export type TweetToggle = {
  /** Names the mutation, together with the tweet's id. */
  name: string
  /** Whether the toggle is on for this tweet. */
  isOn: (tweet: Tweet) => boolean
  /** The tweet with the toggle set to `on`, its count moved by one. */
  apply: (tweet: Tweet, on: boolean) => Tweet
  /** Saves the toggle on the API and resolves to the tweet's new count. */
  save: (tweetId: string, on: boolean) => Promise<number>
  /** The tweet with the count the server returned. */
  withCount: (tweet: Tweet, count: number) => Tweet
  /** What the toast says when saving fails. */
  failure: (on: boolean) => string
}

/**
 * Turns a per-tweet toggle (like, retweet) on or off on the timeline, optimistically: the card
 * changes at once and the request follows. If the request fails the card goes back and a toast
 * says so.
 */
export function useTweetToggle(toggle: TweetToggle, tweetId: string) {
  const queryClient = useQueryClient()
  const mutationKey = [toggle.name, tweetId]
  const patch = (update: (tweet: Tweet) => Tweet) => {
    queryClient.setQueryData(timelineQueryOptions.queryKey, (data) =>
      updateTimelineTweet(data, tweetId, update)
    )
  }

  return useMutation({
    mutationKey,
    mutationFn: (on: boolean) => toggle.save(tweetId, on),
    onMutate: async (on) => {
      // A timeline fetch landing now would overwrite the optimistic change.
      await queryClient.cancelQueries({ queryKey: timelineQueryOptions.queryKey })
      patch((tweet) => toggle.apply(tweet, on))
    },
    onSuccess: (count) => {
      // Take the server's count, unless a later tap is still on its way: that one wins.
      if (queryClient.isMutating({ mutationKey }) > 1) return
      patch((tweet) => toggle.withCount(tweet, count))
    },
    onError: (_error, on) => {
      // Undo only this tap's change; if a later tap already changed the state, it stands.
      patch((tweet) => (toggle.isOn(tweet) === on ? toggle.apply(tweet, !on) : tweet))
      toast.error(toggle.failure(on))
    },
  })
}
