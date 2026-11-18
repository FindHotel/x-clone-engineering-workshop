import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render as rtlRender, screen } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"

import { TweetCard } from "@/components/tweet-card"
import type { Tweet } from "@/queries/timeline"

// The card's like button needs a QueryClient.
const render = (ui: ReactElement) =>
  rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>)

const tweet: Tweet = {
  id: "1",
  authorId: "u1",
  author: { name: "Ada Lovelace", handle: "ada" },
  content: "Hello, timeline",
  mediaUrls: [],
  createdAt: "2026-01-02T03:04:05.000Z",
  likeCount: 0,
  retweetCount: 0,
  replyCount: 0,
  likedByMe: false,
  retweetedByMe: false,
}

describe("TweetCard", () => {
  it("shows the author's name and handle, when it was posted, and the text", () => {
    render(<TweetCard tweet={tweet} />)

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByText("@ada")).toBeInTheDocument()
    expect(screen.getByText("Hello, timeline")).toBeInTheDocument()
    expect(document.querySelector("time")).toHaveAttribute("datetime", tweet.createdAt)
  })

  it("shows the handle with a single @ when the API already includes it", () => {
    render(<TweetCard tweet={{ ...tweet, author: { name: "Ada Lovelace", handle: "@ada" } }} />)
    expect(screen.getByText("@ada")).toBeInTheDocument()
  })

  it("shows no image when there is none", () => {
    render(<TweetCard tweet={tweet} />)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("shows the image when there is one", () => {
    render(<TweetCard tweet={{ ...tweet, mediaUrls: ["https://cdn.example/a.png"] }} />)
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://cdn.example/a.png")
  })

  it("shows the like count and whether I liked it", () => {
    render(<TweetCard tweet={{ ...tweet, likeCount: 3, likedByMe: true }} />)
    const like = screen.getByRole("button", { name: "Like, 3 likes" })
    expect(like).toHaveAttribute("aria-pressed", "true")
    expect(like).toHaveTextContent("3")
  })

  it("shows no number while nobody has liked it", () => {
    render(<TweetCard tweet={tweet} />)
    const like = screen.getByRole("button", { name: "Like, 0 likes" })
    expect(like).toHaveAttribute("aria-pressed", "false")
    expect(like).toHaveTextContent(/^$/)
  })
})
