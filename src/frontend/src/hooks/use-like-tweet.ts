import { useTweetToggle, type TweetToggle } from "@/hooks/use-tweet-toggle"
import type { Tweet } from "@/queries/timeline"
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

const like: TweetToggle = {
  name: "like",
  isOn: (tweet) => tweet.likedByMe,
  apply: withLiked,
  save: async (tweetId, liked) => (await setTweetLiked(tweetId, liked)).likeCount,
  withCount: (tweet, likeCount) => ({ ...tweet, likeCount }),
  failure: (liked) =>
    liked ? "Couldn't save your like. Try again." : "Couldn't remove your like. Try again.",
}

/** Likes or unlikes a tweet on the timeline, optimistically (see `useTweetToggle`). */
export function useLikeTweet(tweetId: string) {
  return useTweetToggle(like, tweetId)
}
