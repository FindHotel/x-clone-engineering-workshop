import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ReplyComposer, TweetReplies } from "@/components/tweet-replies"
import { postReply, repliesQueryOptions } from "@/queries/replies"
import type { Tweet } from "@/queries/timeline"

vi.mock("@/queries/replies", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/queries/replies")>()),
  postReply: vi.fn(),
}))

const renderWith = (queryClient: QueryClient, ui: ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)

afterEach(() => {
  vi.clearAllMocks()
})

describe("TweetReplies", () => {
  it("lists the replies in order, each with its author and text", () => {
    const queryClient = new QueryClient()
    const reply = (id: string, content: string) =>
      ({
        id,
        content,
        author: { name: "Grace", handle: "grace" },
        mediaUrls: [],
        createdAt: "2026-01-02T03:04:05.000Z",
      }) as unknown as Tweet
    queryClient.setQueryData(repliesQueryOptions("t1").queryKey, [
      reply("r1", "first"),
      reply("r2", "second"),
    ])

    renderWith(queryClient, <TweetReplies tweetId="t1" />)

    const items = screen.getAllByRole("listitem")
    expect(screen.getByRole("list", { name: "Replies" })).toBeInTheDocument()
    expect(items[0]).toHaveTextContent("Grace@grace")
    expect(items[0]).toHaveTextContent("first")
    expect(items[1]).toHaveTextContent("second")
  })
})

describe("ReplyComposer", () => {
  const box = () => screen.getByRole("textbox", { name: "Your reply" })
  const send = () => screen.getByRole("button", { name: "Post reply" })

  it("can't post an empty reply or one with only spaces", () => {
    renderWith(new QueryClient(), <ReplyComposer tweetId="t1" onDone={vi.fn()} />)

    expect(send()).toBeDisabled()
    fireEvent.change(box(), { target: { value: "  \n " } })
    expect(send()).toBeDisabled()
    fireEvent.keyDown(box(), { key: "Enter", ctrlKey: true })
    fireEvent.submit(box().closest("form") as HTMLFormElement)

    expect(postReply).not.toHaveBeenCalled()
  })

  it("posts the trimmed text with Ctrl+Enter", async () => {
    vi.mocked(postReply).mockResolvedValue({ id: "r1" } as Tweet)
    renderWith(new QueryClient(), <ReplyComposer tweetId="t1" onDone={vi.fn()} />)

    fireEvent.change(box(), { target: { value: "  hello  " } })
    expect(send()).toBeEnabled()
    fireEvent.keyDown(box(), { key: "Enter", ctrlKey: true })

    await waitFor(() => {
      expect(postReply).toHaveBeenCalledWith("t1", "hello")
    })
  })
})
