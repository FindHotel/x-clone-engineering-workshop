import type { APIRequestContext, Page } from "@playwright/test"

import { expect, test } from "./fixtures"

// XC-5: Sign up. Signing up needs a signed-out browser, so every test here starts from an empty
// session instead of the saved sign-in (which stays untouched).
test.use({ storageState: { cookies: [], origins: [] } })

const PASSWORD = "correct-horse-42"

// A new address per run: the API is shared, and an email can only be signed up once.
function newEmail(label: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `xc5-${label}-${id}@example.com`
}

// Asks the API directly, from a request context of its own (its cookies never reach the page).
async function canSignIn(request: APIRequestContext, email: string, password: string) {
  const res = await request.post("/api/auth/sign-in/email", { data: { email, password } })
  return res.ok()
}

async function fillSignUp(
  page: Page,
  values: { email: string; password: string; confirmPassword?: string }
) {
  await page.getByLabel("Email").fill(values.email)
  await page.getByLabel("Password", { exact: true }).fill(values.password)
  await page.getByLabel("Confirm password").fill(values.confirmPassword ?? values.password)
}

test("AC1: I can create an account with an email and a password", async ({
  page,
  request,
  evidence,
}) => {
  const email = newEmail("ac1")

  await evidence.step("Open the sign-up screen", async () => {
    await page.goto("/sign-up")
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible()
  })
  await evidence.step("Enter an email and a password", async () => {
    await fillSignUp(page, { email, password: PASSWORD })
  })
  await evidence.step("Sign up", async () => {
    await page.getByRole("button", { name: "Sign up" }).click()
    await expect(page).toHaveURL(/\/$/)
  })
  await evidence.step("The account exists: its email and password sign in", async () => {
    expect(await canSignIn(request, email, PASSWORD)).toBe(true)
  })
})

test("AC2: after signing up I am signed in and taken into the app", async ({
  page,
  evidence,
}) => {
  const email = newEmail("ac2")

  await evidence.step("Open the sign-up screen while signed out", async () => {
    await page.goto("/sign-up")
    await expect(page.getByRole("button", { name: /^Sign out/ })).toHaveCount(0)
  })
  await evidence.step("Sign up with a new email and a password", async () => {
    await fillSignUp(page, { email, password: PASSWORD })
    await page.getByRole("button", { name: "Sign up" }).click()
  })
  await evidence.step("We land in the app, signed in as the new account", async () => {
    await expect(page).toHaveURL(/\/$/)
    const local = email.split("@")[0]
    await expect(page.getByRole("button", { name: `Sign out (${local})` })).toBeVisible()
  })
  await evidence.step("Reloading keeps us signed in", async () => {
    await page.reload()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole("button", { name: /^Sign out/ })).toBeVisible()
  })
})

test("AC3: a used email or invalid details show a clear message and create no account", async ({
  page,
  request,
  evidence,
}) => {
  const usedEmail = newEmail("used")
  const otherPassword = "another-password-77"

  await evidence.step("An account with this email already exists", async () => {
    const res = await request.post("/api/auth/sign-up/email", {
      data: { email: usedEmail, password: PASSWORD, name: "Already here" },
    })
    expect(res.ok()).toBe(true)
  })
  await evidence.step("Try to sign up again with the same email", async () => {
    await page.goto("/sign-up")
    await fillSignUp(page, { email: usedEmail, password: otherPassword })
    await page.getByRole("button", { name: "Sign up" }).click()
  })
  await evidence.step("A clear message says the email is taken; we stay signed out", async () => {
    await expect(page.getByRole("alert")).toHaveText(
      "An account with this email already exists. Try signing in instead."
    )
    await expect(page).toHaveURL(/\/sign-up$/)
    await expect(page.getByRole("button", { name: /^Sign out/ })).toHaveCount(0)
  })
  await evidence.step("No second account: the new password doesn't sign in", async () => {
    expect(await canSignIn(request, usedEmail, otherPassword)).toBe(false)
  })

  const badEmail = "not-an-email"
  await evidence.step("Enter an email that isn't valid", async () => {
    await page.reload()
    await fillSignUp(page, { email: badEmail, password: PASSWORD })
    await page.getByRole("button", { name: "Sign up" }).click()
  })
  await evidence.step("A clear message asks for a valid email", async () => {
    await expect(page.getByText("Enter a valid email")).toBeVisible()
    await expect(page).toHaveURL(/\/sign-up$/)
  })

  const shortEmail = newEmail("short")
  await evidence.step("Enter a password that is too short", async () => {
    await page.reload()
    await fillSignUp(page, { email: shortEmail, password: "short" })
    await page.getByRole("button", { name: "Sign up" }).click()
  })
  await evidence.step("A clear message gives the password rule", async () => {
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible()
    await expect(page).toHaveURL(/\/sign-up$/)
  })

  const mismatchEmail = newEmail("mismatch")
  await evidence.step("Enter passwords that don't match", async () => {
    await page.reload()
    await fillSignUp(page, {
      email: mismatchEmail,
      password: PASSWORD,
      confirmPassword: `${PASSWORD}-typo`,
    })
    await page.getByRole("button", { name: "Sign up" }).click()
  })
  await evidence.step("A clear message says the passwords don't match", async () => {
    await expect(page.getByText("Passwords do not match")).toBeVisible()
    await expect(page).toHaveURL(/\/sign-up$/)
    await expect(page.getByRole("button", { name: /^Sign out/ })).toHaveCount(0)
  })
  await evidence.step("None of these attempts created an account", async () => {
    expect(await canSignIn(request, badEmail, PASSWORD)).toBe(false)
    expect(await canSignIn(request, shortEmail, "short")).toBe(false)
    expect(await canSignIn(request, mismatchEmail, PASSWORD)).toBe(false)
  })
})
