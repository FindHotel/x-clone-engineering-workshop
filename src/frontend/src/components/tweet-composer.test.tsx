import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TweetComposer } from "@/components/tweet-composer"
import { IMAGE_NOT_ALLOWED, TweetRejectedError, postTweet, uploadImage } from "@/queries/tweets"
import type { Tweet } from "@/queries/timeline"

vi.mock("@/queries/tweets", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/queries/tweets")>()),
  postTweet: vi.fn(),
  uploadImage: vi.fn(),
}))

const renderComposer = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TweetComposer />
    </QueryClientProvider>
  )

const box = () => screen.getByRole("textbox", { name: "What's happening?" })
const post = () => screen.getByRole("button", { name: "Post" })
const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!
const choose = (file: File) => {
  fireEvent.change(fileInput(), { target: { files: [file] } })
}
const png = new File(["png"], "dot.png", { type: "image/png" })

beforeEach(() => {
  // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => "blob:img")
    URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("TweetComposer", () => {
  it("can't post with nothing, or only spaces and new lines, written", () => {
    renderComposer()
    expect(post()).toBeDisabled()
    fireEvent.change(box(), { target: { value: "  \n " } })
    expect(post()).toBeDisabled()
    fireEvent.keyDown(box(), { key: "Enter", ctrlKey: true })
    expect(postTweet).not.toHaveBeenCalled()
  })

  it("posts the trimmed text and clears the box", async () => {
    vi.mocked(postTweet).mockResolvedValue({ id: "t1" } as Tweet)
    renderComposer()
    fireEvent.change(box(), { target: { value: "  hello \n" } })
    fireEvent.click(post())

    await waitFor(() => {
      expect(postTweet).toHaveBeenCalledWith("hello", [])
    })
    expect(box()).toHaveValue("")
  })

  it("says by how much a tweet is too long, and won't post it", () => {
    renderComposer()
    fireEvent.change(box(), { target: { value: "a".repeat(282) } })
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your tweet is 2 characters too long. The limit is 280."
    )
    expect(post()).toBeDisabled()
  })

  it("attaches one image, which alone is enough to post, and can remove it", () => {
    renderComposer()
    choose(png)
    expect(screen.getByRole("img", { name: "Image to post" })).toHaveAttribute("src", "blob:img")
    expect(screen.queryByRole("button", { name: "Add an image" })).not.toBeInTheDocument()
    expect(post()).toBeEnabled()

    fireEvent.click(screen.getByRole("button", { name: "Remove image" }))
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add an image" })).toBeInTheDocument()
  })

  it("refuses a file that isn't an allowed image, saying why", () => {
    renderComposer()
    choose(new File(["x"], "notes.txt", { type: "text/plain" }))
    expect(screen.getByRole("alert")).toHaveTextContent(IMAGE_NOT_ALLOWED)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("puts the text back and says why when the API refuses the image", async () => {
    vi.mocked(uploadImage).mockRejectedValue(new TweetRejectedError(IMAGE_NOT_ALLOWED))
    renderComposer()
    fireEvent.change(box(), { target: { value: "with a fake image" } })
    choose(png)
    fireEvent.click(post())

    expect(await screen.findByRole("alert")).toHaveTextContent(IMAGE_NOT_ALLOWED)
    expect(box()).toHaveValue("with a fake image")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(postTweet).not.toHaveBeenCalled()
  })

  it("puts the text and image back when posting fails for another reason", async () => {
    vi.mocked(postTweet).mockRejectedValue(new Error("500"))
    vi.mocked(uploadImage).mockResolvedValue("k1")
    renderComposer()
    fireEvent.change(box(), { target: { value: "try me" } })
    choose(png)
    fireEvent.click(post())

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't post your tweet. Try again.")
    expect(box()).toHaveValue("try me")
    expect(screen.getByRole("img", { name: "Image to post" })).toBeInTheDocument()
  })
})
