import type { Tweet } from "@/queries/timeline"

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

/** The longest tweet the API takes, after trimming. */
export const TWEET_MAX_LENGTH = 280

/** The images the API takes: these types, up to 5 MB each. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024

export const IMAGE_NOT_ALLOWED =
  "That image can't be posted. Use a JPEG, PNG, GIF or WebP image of up to 5 MB."

/** The API refused what was sent; `message` says why, in words a person can act on. */
export class TweetRejectedError extends Error {}

/** Why this file can't be attached, or null when it can. */
export function imageProblem(file: { type: string; size: number }): string | null {
  return IMAGE_TYPES.includes(file.type) && file.size <= IMAGE_MAX_BYTES ? null : IMAGE_NOT_ALLOWED
}

/** Why this text can't be posted as it is, or null when it can (empty is handled by the caller). */
export function tweetLengthProblem(text: string): string | null {
  const over = text.trim().length - TWEET_MAX_LENGTH
  if (over <= 0) return null
  return `Your tweet is ${over.toString()} ${over === 1 ? "character" : "characters"} too long. The limit is ${TWEET_MAX_LENGTH.toString()}.`
}

/** Uploads one image and resolves to the media key to post it with. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append("files", file)
  const res = await fetch("/api/upload", { method: "POST", credentials: "include", body })
  // 400: not a supported image (the API sniffs the bytes) or over 5 MB; 413: far too large.
  if (res.status === 400 || res.status === 413) throw new TweetRejectedError(IMAGE_NOT_ALLOWED)
  if (!res.ok) throw new Error(`Couldn't upload the image (${res.status.toString()})`)
  return ((await res.json()) as { keys: string[] }).keys[0]
}

/** Posts a top-level tweet and resolves to it, as saved. */
export async function postTweet(content: string, mediaKeys: string[]): Promise<Tweet> {
  const res = await fetch("/api/tweets", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mediaKeys.length > 0 ? { content, mediaKeys } : { content }),
  })
  if (res.status === 400) throw new TweetRejectedError("The tweet couldn't be posted as it is.")
  if (!res.ok) throw new Error(`Couldn't post the tweet (${res.status.toString()})`)
  return (await res.json()) as Tweet
}
