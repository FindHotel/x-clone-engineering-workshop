import { formatRelativeTime } from "@/lib/format-relative-time"
import { formatHandle } from "@/lib/user"
import type { Tweet } from "@/queries/timeline"

/** Who posted a tweet and when, its text and its images: shared by tweets and replies. */
export function TweetBody({ tweet }: { tweet: Tweet }) {
  const postedAt = new Date(tweet.createdAt)

  return (
    <>
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
    </>
  )
}
