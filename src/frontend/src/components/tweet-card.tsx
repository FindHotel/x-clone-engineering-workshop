import { HugeiconsIcon } from "@hugeicons/react"
import { Comment01Icon, FavouriteIcon, RepeatIcon } from "@hugeicons/core-free-icons"
import { useState } from "react"

import { TweetBody } from "@/components/tweet-body"
import { ReplyComposer, TweetReplies } from "@/components/tweet-replies"
import { Button } from "@/components/ui/button"
import { useLikeTweet } from "@/hooks/use-like-tweet"
import { useRetweetTweet } from "@/hooks/use-retweet-tweet"
import { cn } from "@/lib/utils"
import type { Tweet } from "@/queries/timeline"

export function TweetCard({ tweet }: { tweet: Tweet }) {
  const [replying, setReplying] = useState(false)

  return (
    <article className="flex flex-col gap-2 border-b border-border px-4 py-3">
      <TweetBody tweet={tweet} />
      <footer className="-ml-2 flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={replying}
          aria-label={`Reply, ${tweet.replyCount.toString()} ${tweet.replyCount === 1 ? "reply" : "replies"}`}
          onClick={() => {
            setReplying((open) => !open)
          }}
          className="rounded-full text-muted-foreground hover:bg-sky-500/10 hover:text-sky-600"
        >
          <HugeiconsIcon aria-hidden icon={Comment01Icon} strokeWidth={2} className="size-4" />
          {/* As on X, a zero count shows nothing; the label above still says it. */}
          {tweet.replyCount > 0 && <span className="tabular-nums">{tweet.replyCount}</span>}
        </Button>
        <RetweetButton tweet={tweet} />
        <LikeButton tweet={tweet} />
      </footer>
      {tweet.replyCount > 0 && <TweetReplies tweetId={tweet.id} />}
      {replying && (
        <ReplyComposer
          tweetId={tweet.id}
          onDone={() => {
            setReplying(false)
          }}
        />
      )}
    </article>
  )
}

function RetweetButton({ tweet }: { tweet: Tweet }) {
  const { mutate } = useRetweetTweet(tweet.id)
  const retweeted = tweet.retweetedByMe
  const count = tweet.retweetCount

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={retweeted}
      aria-label={`Retweet, ${count.toString()} ${count === 1 ? "retweet" : "retweets"}`}
      onClick={() => {
        mutate(!retweeted)
      }}
      className={cn(
        "rounded-full text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600",
        retweeted && "text-emerald-600 dark:text-emerald-500"
      )}
    >
      <HugeiconsIcon aria-hidden icon={RepeatIcon} strokeWidth={2} className="size-4" />
      {/* As on X, a zero count shows nothing; the label above still says it. */}
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </Button>
  )
}

function LikeButton({ tweet }: { tweet: Tweet }) {
  const { mutate } = useLikeTweet(tweet.id)
  const liked = tweet.likedByMe

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={liked}
      aria-label={`Like, ${tweet.likeCount.toString()} ${tweet.likeCount === 1 ? "like" : "likes"}`}
      onClick={() => {
        mutate(!liked)
      }}
      className={cn(
        "rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600",
        liked && "text-rose-600 dark:text-rose-500"
      )}
    >
      <HugeiconsIcon
        aria-hidden
        icon={FavouriteIcon}
        strokeWidth={2}
        className={cn("size-4", liked && "fill-current")}
      />
      {/* As on X, a zero count shows nothing; the label above still says it. */}
      {tweet.likeCount > 0 && <span className="tabular-nums">{tweet.likeCount}</span>}
    </Button>
  )
}
