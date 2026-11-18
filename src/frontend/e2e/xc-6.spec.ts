import type { APIRequestContext, Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-6: Sign in. Signing in needs a signed-out browser, so every test here starts from an empty
// session instead of the saved sign-in (which stays untouched). Each test signs in as an account
// of its own, created through the API, never as the person's account.
test.use({ storageState: { cookies: [], origins: [] } })

const PASSWORD = "correct-horse-42"

// A new account per test: the API is shared, and an email can only be signed up once. The sign-up
// runs in the `request` context, whose cookies never reach the page, so the page stays signed out.
async function newAccount(request: APIRequestContext, label: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `xc6-${label}-${id}@example.com`
  const res = await request.post("/api/auth/sign-up/email", {
    data: { email, password: PASSWORD, name: `XC-6 ${label}` },
  })
  expect(res.ok()).toBe(true)
  return email
}

async function fillSignIn(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
}

const signOutButton = (page: Page) => page.getByRole("button", { name: /^Sign out/ })

test("AC1: I can sign in with my email and password", async ({ page, request, evidence }) => {
  const email = await newAccount(request, "ac1")

  await evidence.step("Open the sign-in screen while signed out", async () => {
    await page.goto("/sign-in")
    await expect(page.getByRole("heading", { name: "Sign in to X Clone" })).toBeVisible()
    await expect(signOutButton(page)).toHaveCount(0)
  })
  await evidence.step("Enter my email and password", async () => {
    await fillSignIn(page, email, PASSWORD)
  })
  await evidence.step("Sign in", async () => {
    await page.getByRole("button", { name: "Sign in" }).click()
  })
  await evidence.step("I am signed in as my account", async () => {
    await expect(signOutButton(page)).toHaveText(`Sign out (XC-6 ac1)`)
  })
  await evidence.step("Reloading keeps me signed in", async () => {
    await page.reload()
    await expect(signOutButton(page)).toBeVisible()
  })
})

test("AC2: after signing in I am taken to the home timeline", async ({
  page,
  request,
  evidence,
}) => {
  const email = await newAccount(request, "ac2")

  await evidence.step("Sign in from the sign-in screen", async () => {
    await page.goto("/sign-in")
    await fillSignIn(page, email, PASSWORD)
    await page.getByRole("button", { name: "Sign in" }).click()
  })
  await evidence.step("We land on the home timeline", async () => {
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole("heading", { name: "Home", level: 1 })).toBeVisible()
    await expect(
      page.getByRole("main").getByRole("article").first().or(page.getByText("No tweets yet"))
    ).toBeVisible()
  })
})

test("AC3: a wrong email or password shows a clear message and I stay signed out", async ({
  page,
  request,
  evidence,
}) => {
  const email = await newAccount(request, "ac3")

  await evidence.step("Enter my email with a wrong password", async () => {
    await page.goto("/sign-in")
    await fillSignIn(page, email, "wrong-password-99")
    await page.getByRole("button", { name: "Sign in" }).click()
  })
  await evidence.step("A clear message says the email or password is wrong", async () => {
    await expect(page.getByRole("alert")).toHaveText("Incorrect email or password.")
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(signOutButton(page)).toHaveCount(0)
  })

  await evidence.step("Enter an email that has no account", async () => {
    await page.reload()
    await fillSignIn(page, `nobody-${Date.now()}@example.com`, PASSWORD)
    await page.getByRole("button", { name: "Sign in" }).click()
  })
  await evidence.step("The same clear message; we stay on the sign-in screen", async () => {
    await expect(page.getByRole("alert")).toHaveText("Incorrect email or password.")
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(signOutButton(page)).toHaveCount(0)
  })

  await evidence.step("Still signed out: the timeline sends us back to sign in", async () => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(page.getByRole("heading", { name: "Sign in to X Clone" })).toBeVisible()
  })
})
