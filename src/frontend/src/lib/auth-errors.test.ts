import { describe, expect, it } from "vitest"

import { mapAuthErrorToMessage } from "@/lib/auth-errors"

describe("mapAuthErrorToMessage", () => {
  it("says a wrong email or password plainly, without saying which one", () => {
    expect(
      mapAuthErrorToMessage({
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
      })
    ).toBe("Incorrect email or password.")
  })

  it("points a used email to signing in", () => {
    expect(
      mapAuthErrorToMessage({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" })
    ).toBe("An account with this email already exists. Try signing in instead.")
  })

  it("falls back to the server's message for an unknown code", () => {
    expect(
      mapAuthErrorToMessage({ code: "TOO_MANY_REQUESTS", message: "Slow down" })
    ).toBe("Slow down")
  })

  it("falls back to a generic message when there is nothing to show", () => {
    expect(mapAuthErrorToMessage({})).toBe(
      "Something went wrong. Please try again."
    )
  })

  it("returns an empty string when there is no error", () => {
    expect(mapAuthErrorToMessage(null)).toBe("")
  })
})
