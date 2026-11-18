import { useTweetToggle, type TweetToggle } from "@/hooks/use-tweet-toggle"
import type { Tweet } from "@/queries/timeline"
import { setTweetRetweeted } from "@/queries/tweets"

/** The tweet as it looks once `retweeted` is applied: the count moves by one only on a change. */
export function withRetweeted(tweet: Tweet, retweeted: boolean): Tweet {
  if (tweet.retweetedByMe === retweeted) return tweet
  return {
    ...tweet,
    retweetedByMe: retweeted,
    retweetCount: Math.max(0, tweet.retweetCount + (retweeted ? 1 : -1)),
  }
}

const retweet: TweetToggle = {
  name: "retweet",
  isOn: (tweet) => tweet.retweetedByMe,
  apply: withRetweeted,
  save: async (tweetId, retweeted) =>
    (await setTweetRetweeted(tweetId, retweeted)).retweetCount,
  withCount: (tweet, retweetCount) => ({ ...tweet, retweetCount }),
  failure: (retweeted) =>
    retweeted ? "Couldn't retweet. Try again." : "Couldn't undo the retweet. Try again.",
}

/** Retweets or undoes a retweet on the timeline, optimistically (see `useTweetToggle`). */
export function useRetweetTweet(tweetId: string) {
  return useTweetToggle(retweet, tweetId)
}
