import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { TweetBody } from "@/components/tweet-body"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { usePostReply } from "@/hooks/use-post-reply"
import { REPLY_MAX_LENGTH, repliesQueryOptions, replyContent } from "@/queries/replies"
import type { Tweet } from "@/queries/timeline"

/** A tweet's replies, shown right under it in its card. */
export function TweetReplies({ tweetId }: { tweetId: string }) {
  const { data: replies, status, refetch } = useQuery(repliesQueryOptions(tweetId))

  if (status === "pending") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading replies…
      </p>
    )
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-2 text-sm" role="alert">
        <span className="text-muted-foreground">Couldn't load the replies.</span>
        <Button type="button" variant="outline" size="xs" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    )
  }
  if (replies.length === 0) return null

  return (
    <ul aria-label="Replies" className="flex flex-col gap-3 border-l-2 border-border pl-3">
      {replies.map((reply: Tweet) => (
        <li key={reply.id} className="flex flex-col gap-1">
          <TweetBody tweet={reply} />
        </li>
      ))}
    </ul>
  )
}

/** Writes a reply to a tweet, in place. Posting needs some text; spaces alone don't count. */
export function ReplyComposer({ tweetId, onDone }: { tweetId: string; onDone: () => void }) {
  const [draft, setDraft] = useState("")
  const { mutate, isPending } = usePostReply(tweetId)
  const content = replyContent(draft)

  const submit = () => {
    if (!content || isPending) return
    mutate(content, {
      onSuccess: onDone,
      onError: () => toast.error("Couldn't post your reply. Try again."),
    })
  }

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Textarea
        aria-label="Your reply"
        placeholder="Post your reply"
        autoFocus
        maxLength={REPLY_MAX_LENGTH}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
        }}
        onKeyDown={(event) => {
          // Ctrl/Cmd+Enter posts, as on X; plain Enter is a new line.
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            submit()
          }
        }}
        className="min-h-12 text-base"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="rounded-full" disabled={!content || isPending}>
          {isPending ? "Posting…" : "Post reply"}
        </Button>
      </div>
    </form>
  )
}
