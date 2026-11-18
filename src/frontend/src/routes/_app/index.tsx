import { createFileRoute } from "@tanstack/react-router"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TweetCard } from "@/components/tweet-card"
import { Button } from "@/components/ui/button"
import { useLoadMoreOnScroll } from "@/hooks/use-load-more-on-scroll"
import { timelineQueryOptions } from "@/queries/timeline"

export const Route = createFileRoute("/_app/")({
  component: Home,
})

function Home() {
  const {
    data,
    status,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useInfiniteQuery(timelineQueryOptions)

  // Re-armed after every page, so a sentinel still in view keeps loading.
  const sentinelRef = useLoadMoreOnScroll<HTMLDivElement>(
    () => void fetchNextPage(),
    status === "success" && hasNextPage && !isFetchingNextPage && !isFetchNextPageError
  )

  const tweets = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Home</h1>

      {status === "pending" && (
        <p className="text-muted-foreground" role="status">
          Loading tweets…
        </p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2" role="alert">
          <p className="text-muted-foreground">Couldn't load the timeline.</p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      {status === "success" && tweets.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No tweets yet. When people post, their tweets show up here.
        </p>
      )}

      {tweets.length > 0 && (
        <div className="rounded-lg border border-border border-b-0">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} aria-hidden />

      {isFetchingNextPage && (
        <p className="text-center text-sm text-muted-foreground" role="status">
          Loading more…
        </p>
      )}

      {isFetchNextPageError && (
        <div className="flex flex-col items-center gap-2" role="alert">
          <p className="text-sm text-muted-foreground">Couldn't load older tweets.</p>
          <Button type="button" variant="outline" onClick={() => void fetchNextPage()}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
