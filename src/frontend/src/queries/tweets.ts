/** Likes (`liked: true`) or unlikes a tweet. Both are idempotent on the API. */
export async function setTweetLiked(
  tweetId: string,
  liked: boolean
): Promise<{ likeCount: number }> {
  const res = await fetch(`/api/tweets/${encodeURIComponent(tweetId)}/like`, {
    method: liked ? "POST" : "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error(`Couldn't save the like (${res.status.toString()})`)
  return (await res.json()) as { likeCount: number }
}

/** Retweets (`retweeted: true`) or undoes a retweet. Both are idempotent on the API. */
export async function setTweetRetweeted(
  tweetId: string,
  retweeted: boolean
): Promise<{ retweetCount: number }> {
  const res = await fetch(`/api/tweets/${encodeURIComponent(tweetId)}/retweet`, {
    method: retweeted ? "POST" : "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error(`Couldn't save the retweet (${res.status.toString()})`)
  return (await res.json()) as { retweetCount: number }
}
