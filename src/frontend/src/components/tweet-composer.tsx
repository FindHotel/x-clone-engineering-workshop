import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, ImageAdd01Icon } from "@hugeicons/core-free-icons"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { usePostTweet } from "@/hooks/use-post-tweet"
import { cn } from "@/lib/utils"
import {
  IMAGE_TYPES,
  TWEET_MAX_LENGTH,
  TweetRejectedError,
  imageProblem,
  tweetLengthProblem,
} from "@/queries/tweets"

type Attached = { file: File; url: string }

/** The countdown shows once this few characters are left, as on X. */
const COUNTDOWN_FROM = 20

/**
 * Writes a tweet, with one optional image, on top of the timeline. Posting needs some text or an
 * image; spaces alone don't count. Anything the API wouldn't take is explained in place.
 */
export function TweetComposer() {
  const [draft, setDraft] = useState("")
  const [attached, setAttached] = useState<Attached | null>(null)
  // What went wrong with the last image or post. Too long is worked out from the text instead.
  const [problem, setProblem] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const { mutateAsync } = usePostTweet()

  const content = draft.trim()
  const tooLong = tweetLengthProblem(draft)
  const canPost = (content !== "" || attached !== null) && !tooLong
  const message = tooLong ?? problem
  const left = TWEET_MAX_LENGTH - content.length

  const attach = (next: Attached | null) => {
    setAttached((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return next
    })
  }

  const chooseImage = (file: File | undefined) => {
    if (!file) return
    const notAllowed = imageProblem(file)
    setProblem(notAllowed)
    if (!notAllowed) attach({ file, url: URL.createObjectURL(file) })
  }

  const submit = () => {
    if (!canPost) return
    const sentDraft = draft
    const image = attached?.file ?? null
    // The tweet is on the timeline at once, so the box is free for the next one.
    setDraft("")
    setAttached(null)
    setProblem(null)
    mutateAsync({ content, image }).catch((error: unknown) => {
      // Put the tweet back to fix or retry, unless something new was started meanwhile. A refused
      // image stays out: it would only be refused again.
      setDraft((current) => (current === "" ? sentDraft : current))
      if (image && !(error instanceof TweetRejectedError)) {
        setAttached((current) => current ?? { file: image, url: URL.createObjectURL(image) })
      }
      setProblem(
        error instanceof TweetRejectedError ? error.message : "Couldn't post your tweet. Try again."
      )
    })
    if (attached) URL.revokeObjectURL(attached.url)
  }

  return (
    <form
      aria-label="Post a tweet"
      className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Textarea
        aria-label="What's happening?"
        placeholder="What's happening?"
        aria-invalid={tooLong ? true : undefined}
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
      />
      {attached && (
        <div className="relative w-fit">
          <img
            src={attached.url}
            alt="Image to post"
            className="max-h-64 rounded-xl border border-border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Remove image"
            onClick={() => {
              attach(null)
            }}
            className="absolute top-1 right-1 rounded-full"
          >
            <HugeiconsIcon aria-hidden icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        </div>
      )}
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <div className="flex items-center gap-2 border-t border-border pt-2">
        {!attached && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Add an image"
            onClick={() => fileInput.current?.click()}
            className="rounded-full text-sky-600 hover:bg-sky-500/10 hover:text-sky-600"
          >
            <HugeiconsIcon aria-hidden icon={ImageAdd01Icon} strokeWidth={2} className="size-5" />
          </Button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          hidden
          onChange={(event) => {
            chooseImage(event.target.files?.[0])
            // Choosing the same file again should still count as a choice.
            event.target.value = ""
          }}
        />
        <span
          aria-hidden
          className={cn(
            "ml-auto text-sm tabular-nums text-muted-foreground",
            left < 0 && "text-destructive"
          )}
        >
          {left <= COUNTDOWN_FROM ? left : null}
        </span>
        <Button type="submit" className="rounded-full px-4" disabled={!canPost}>
          Post
        </Button>
      </div>
    </form>
  )
}
