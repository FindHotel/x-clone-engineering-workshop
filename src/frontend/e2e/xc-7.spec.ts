import type { Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-7: Keep the app behind sign-in. Every test here is signed out: it starts from an empty
// session instead of the saved sign-in (which stays untouched, and is never signed out).
test.use({ storageState: { cookies: [], origins: [] } })

// Pages a signed-out visitor might try: the app's home, made-up pages, a nested path with a query
// string and a hash. None of them may show anything but the sign-in screen.
const OTHER_PAGES = ["/", "/settings", "/profile/someone", "/tweets/123?tab=replies#top"]

const signInHeading = (page: Page) => page.getByRole("heading", { name: "Sign in to X Clone" })
const signUpHeading = (page: Page) => page.getByRole("heading", { name: "Create your account" })

// Anything that only a signed-in person should see: the app header, the timeline, tweets.
async function expectNoAppContent(page: Page) {
  await expect(page.getByRole("button", { name: /^Sign out/ })).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Home" })).toHaveCount(0)
  await expect(page.getByRole("article")).toHaveCount(0)
}

test("AC1: when signed out I can only see the sign-in and sign-up screens", async ({
  page,
  evidence,
}) => {
  // The timeline must never be asked for while signed out, not even before a redirect.
  const timelineCalls: string[] = []
  page.on("request", (req) => {
    if (new URL(req.url()).pathname.startsWith("/api/timeline")) timelineCalls.push(req.url())
  })

  await evidence.step("The sign-in screen opens", async () => {
    await page.goto("/sign-in")
    await expect(signInHeading(page)).toBeVisible()
    await expectNoAppContent(page)
  })
  await evidence.step("Its link goes to the sign-up screen, which opens too", async () => {
    await page.getByRole("link", { name: "Sign up" }).click()
    await expect(page).toHaveURL(/\/sign-up$/)
    await expect(signUpHeading(page)).toBeVisible()
    await expectNoAppContent(page)
  })
  await evidence.step("And back to the sign-in screen", async () => {
    await page.getByRole("link", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(signInHeading(page)).toBeVisible()
  })
  for (const path of OTHER_PAGES) {
    await evidence.step(`Any other page (${path}) shows only the sign-in screen`, async () => {
      await page.goto(path)
      await expect(signInHeading(page)).toBeVisible()
      await expectNoAppContent(page)
    })
  }
  await evidence.step("No timeline was loaded while signed out", async () => {
    expect(timelineCalls).toEqual([])
  })
})

test("AC2: opening any other page while signed out sends me to the sign-in screen", async ({
  page,
  evidence,
}) => {
  for (const path of OTHER_PAGES) {
    await evidence.step(`Open ${path} while signed out`, async () => {
      await page.goto(path)
    })
    await evidence.step("We are sent to the sign-in screen", async () => {
      await expect(page).toHaveURL(/\/sign-in$/)
      await expect(signInHeading(page)).toBeVisible()
      await expectNoAppContent(page)
    })
  }
  await evidence.step("Moving to another page without a reload also lands on sign-in", async () => {
    await page.goto("/sign-up")
    await page.evaluate(() => {
      history.pushState({}, "", "/settings")
      dispatchEvent(new PopStateEvent("popstate"))
    })
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(signInHeading(page)).toBeVisible()
  })
})
