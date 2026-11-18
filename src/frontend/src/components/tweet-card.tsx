import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon, RepeatIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useLikeTweet } from "@/hooks/use-like-tweet"
import { useRetweetTweet } from "@/hooks/use-retweet-tweet"
import { formatRelativeTime } from "@/lib/format-relative-time"
import { formatHandle } from "@/lib/user"
import { cn } from "@/lib/utils"
import type { Tweet } from "@/queries/timeline"

export function TweetCard({ tweet }: { tweet: Tweet }) {
  const postedAt = new Date(tweet.createdAt)

  return (
    <article className="flex flex-col gap-2 border-b border-border px-4 py-3">
      <header className="flex min-w-0 items-baseline gap-1 text-sm">
        <span className="truncate font-bold">{tweet.author.name}</span>
        <span className="truncate text-muted-foreground">{formatHandle(tweet.author.handle)}</span>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <time
          dateTime={tweet.createdAt}
          title={postedAt.toLocaleString()}
          className="shrink-0 text-muted-foreground"
        >
          {formatRelativeTime(tweet.createdAt)}
        </time>
      </header>
      {tweet.content && (
        <p className="whitespace-pre-wrap break-words">{tweet.content}</p>
      )}
      {tweet.mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-border">
          {tweet.mediaUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt={`Image from ${tweet.author.name}`}
              loading="lazy"
              className="max-h-[510px] w-full object-cover only:col-span-2"
            />
          ))}
        </div>
      )}
      <footer className="-ml-2 flex items-center gap-4">
        <RetweetButton tweet={tweet} />
        <LikeButton tweet={tweet} />
      </footer>
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
