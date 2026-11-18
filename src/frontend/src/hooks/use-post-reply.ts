import { useMutation, useQueryClient } from "@tanstack/react-query"

import { postReply, repliesQueryOptions } from "@/queries/replies"
import { timelineQueryOptions, updateTimelineTweet } from "@/queries/timeline"

/**
 * Posts a reply to a tweet. Once it's saved, it's added to the end of that tweet's replies and
 * the tweet's reply count goes up by one, without refetching the timeline.
 */
export function usePostReply(tweetId: string) {
  const queryClient = useQueryClient()
  const { queryKey } = repliesQueryOptions(tweetId)

  return useMutation({
    mutationFn: (content: string) => postReply(tweetId, content),
    onSuccess: (reply) => {
      // Replies not loaded yet: adding this one alone would hide the others, so fetch them all.
      if (queryClient.getQueryData(queryKey)) {
        queryClient.setQueryData(queryKey, (replies) => [...(replies ?? []), reply])
      } else {
        void queryClient.invalidateQueries({ queryKey })
      }
      queryClient.setQueryData(timelineQueryOptions.queryKey, (data) =>
        updateTimelineTweet(data, tweetId, (tweet) => ({
          ...tweet,
          replyCount: tweet.replyCount + 1,
        }))
      )
    },
  })
}
