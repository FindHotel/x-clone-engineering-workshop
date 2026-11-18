import type { Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-9: Post a tweet.
//
// Runs on the saved sign-in (your own account) and posts through the home page's composer, as
// you. The API can't delete tweets: each run leaves its test tweets on your account, marked
// "XC-9 test". The limits checked here (280 characters; JPEG, PNG, GIF or WebP up to 5 MB) are
// the API's own, from /api/openapi.json.

// The smallest valid PNG (1x1, transparent): the API sniffs the bytes, not the file name.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
)

const unique = (text: string) => `${text} ${Math.random().toString(36).slice(2, 8)}`

const isPostTweet = (url: string, method: string) =>
  method === "POST" && new URL(url).pathname === "/api/tweets"

async function openHome(page: Page) {
  await page.goto("/")
  const box = page.getByRole("textbox", { name: "What's happening?" })
  await expect(box).toBeVisible()
  // The timeline has loaded (or is empty), so the new tweet has something to go on top of.
  await expect(page.getByRole("main").getByText("Loading tweets…")).toHaveCount(0)
  return {
    box,
    post: page.getByRole("main").getByRole("button", { name: "Post", exact: true }),
    tweets: page.getByRole("main").getByRole("article"),
  }
}

/** Picks a file through the composer's own "Add an image" button, as a person would. */
async function chooseImage(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer }
) {
  const chooser = page.waitForEvent("filechooser")
  await page.getByRole("button", { name: "Add an image" }).click()
  await (await chooser).setFiles(file)
}

/** Records every request that would create a tweet or upload an image. */
function watchPosts(page: Page) {
  const sent: string[] = []
  page.on("request", (r) => {
    const path = new URL(r.url()).pathname
    if (r.method() === "POST" && (path === "/api/tweets" || path === "/api/upload")) sent.push(path)
  })
  return sent
}

test("AC1: I can type a tweet and post it, with or without one image", async ({
  page,
  evidence,
}) => {
  const { box, post, tweets } = await evidence.step("Open the home timeline", () => openHome(page))

  const plain = unique("XC-9 test: a tweet with just text")
  await evidence.step("Type a tweet and post it", async () => {
    await box.fill(plain)
    const saved = page.waitForResponse((r) => isPostTweet(r.url(), r.request().method()))
    await post.click()
    expect((await saved).status()).toBe(201)
  })
  await evidence.step("It's posted, with no image", async () => {
    const card = tweets.filter({ hasText: plain })
    await expect(card).toHaveCount(1)
    await expect(card.getByRole("img")).toHaveCount(0)
    await expect(box).toHaveValue("")
  })

  const withImage = unique("XC-9 test: a tweet with an image")
  await evidence.step("Type another tweet and attach one image", async () => {
    await box.fill(withImage)
    await chooseImage(page, { name: "dot.png", mimeType: "image/png", buffer: PNG_1X1 })
    await expect(page.getByRole("img", { name: "Image to post" })).toBeVisible()
    // One image per tweet: the button to add another is gone once one is attached.
    await expect(page.getByRole("button", { name: "Add an image" })).toHaveCount(0)
  })
  await evidence.step("Post it: the tweet shows with its image", async () => {
    const saved = page.waitForResponse((r) => isPostTweet(r.url(), r.request().method()))
    await post.click()
    const tweet = (await (await saved).json()) as { content: string; mediaUrls: string[] }
    expect(tweet.content).toBe(withImage)
    expect(tweet.mediaUrls).toHaveLength(1)
    const card = tweets.filter({ hasText: withImage })
    await expect(card.getByRole("img")).toHaveAttribute("src", tweet.mediaUrls[0])
    await expect(page.getByRole("img", { name: "Image to post" })).toHaveCount(0)
  })
})

test("AC2: my new tweet appears at the top of my timeline straight away", async ({
  page,
  evidence,
}) => {
  const { box, post, tweets } = await evidence.step("Open the home timeline", () => openHome(page))
  const text = unique("XC-9 test: on top straight away")

  // A slow connection: the API takes 3 seconds to save the tweet.
  let release = () => {}
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route("**/api/tweets", async (route) => {
    if (route.request().method() !== "POST") return route.fallback()
    await held
    await route.fallback()
  })

  await evidence.step("On a slow connection, type a tweet and post it", async () => {
    await box.fill(text)
    await post.click()
  })
  await evidence.step("It's at the top of the timeline at once, before the API answers", async () => {
    await expect(tweets.first()).toContainText(text, { timeout: 1000 })
    await expect(box).toHaveValue("")
  })
  await evidence.step("Once the API saves it, it stays at the top, as the saved tweet", async () => {
    const saved = page.waitForResponse((r) => isPostTweet(r.url(), r.request().method()))
    release()
    expect((await saved).status()).toBe(201)
    await expect(tweets.first()).toContainText(text)
    await expect(tweets.first().getByRole("button", { name: /^like,/i })).toBeVisible()
    await expect(tweets.filter({ hasText: text })).toHaveCount(1)
    await expect(page).toHaveURL("/")
  })
  await evidence.step("After a reload it's still the newest tweet", async () => {
    await page.reload()
    await expect(page.getByRole("main").getByRole("article").first()).toContainText(text)
  })
})

test("AC3: I cannot post an empty tweet", async ({ page, evidence }) => {
  const { box, post } = await evidence.step("Open the home timeline", () => openHome(page))
  const sent = watchPosts(page)

  await evidence.step("With nothing written, the tweet can't be posted", async () => {
    await expect(box).toHaveValue("")
    await expect(post).toBeDisabled()
  })
  await evidence.step("Only spaces and new lines: still can't be posted", async () => {
    await box.fill("   \n  ")
    await expect(post).toBeDisabled()
    await box.press("Control+Enter")
    await box.press("Meta+Enter")
  })
  await evidence.step("Nothing was sent", async () => {
    await expect(post).toBeDisabled()
    expect(sent).toEqual([])
  })
  await evidence.step("Once there's real text, it can be posted", async () => {
    await box.fill("XC-9 test: now with words")
    await expect(post).toBeEnabled()
    await box.fill("")
    await expect(post).toBeDisabled()
  })
})

test("AC4: a tweet that's too long, or an image that isn't allowed, shows a clear message", async ({
  page,
  evidence,
}) => {
  const { box, post, tweets } = await evidence.step("Open the home timeline", () => openHome(page))
  const sent = watchPosts(page)
  const message = page.getByRole("main").getByRole("alert")

  await evidence.step("Type a tweet of 281 characters: it says it's too long", async () => {
    await box.fill(`XC-9 test: ${"a".repeat(281 - "XC-9 test: ".length)}`)
    await expect(message).toHaveText("Your tweet is 1 character too long. The limit is 280.")
    await expect(post).toBeDisabled()
    await box.press("Control+Enter")
  })
  await evidence.step("Cut it to 280 characters: the message goes and it can be posted", async () => {
    await box.press("Backspace")
    await expect(message).toHaveCount(0)
    await expect(post).toBeEnabled()
  })

  const notAllowed =
    "That image can't be posted. Use a JPEG, PNG, GIF or WebP image of up to 5 MB."

  await evidence.step("Attach a file that isn't an image: it says so and isn't attached", async () => {
    await chooseImage(page, {
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not an image"),
    })
    await expect(message).toHaveText(notAllowed)
    await expect(page.getByRole("img", { name: "Image to post" })).toHaveCount(0)
  })
  await evidence.step("Attach an image over 5 MB: it says so and isn't attached", async () => {
    await chooseImage(page, {
      name: "huge.png",
      mimeType: "image/png",
      buffer: Buffer.concat([PNG_1X1, Buffer.alloc(5 * 1024 * 1024)]),
    })
    await expect(message).toHaveText(notAllowed)
    await expect(page.getByRole("img", { name: "Image to post" })).toHaveCount(0)
  })
  await evidence.step("Nothing was sent", () => {
    expect(sent).toEqual([])
    return Promise.resolve()
  })

  const text = unique("XC-9 test: this one has a fake image")
  await evidence.step("A file named .png that isn't really an image: the API refuses it", async () => {
    await box.fill(text)
    await chooseImage(page, {
      name: "fake.png",
      mimeType: "image/png",
      buffer: Buffer.from("this is text pretending to be a PNG"),
    })
    await expect(message).toHaveCount(0)
    const refused = page.waitForResponse(
      (r) => new URL(r.url()).pathname === "/api/upload" && r.request().method() === "POST"
    )
    await post.click()
    expect((await refused).status()).toBe(400)
  })
  await evidence.step("It says so, no tweet was posted, and my text is still there", async () => {
    await expect(message).toHaveText(notAllowed)
    await expect(tweets.filter({ hasText: text })).toHaveCount(0)
    await expect(box).toHaveValue(text)
    expect(sent).toEqual(["/api/upload"])
  })
})
