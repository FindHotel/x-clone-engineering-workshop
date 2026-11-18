import { describe, expect, it } from "vitest"

import { safeRedirectPath } from "@/lib/redirect"

describe("safeRedirectPath", () => {
  it("keeps an in-app path with its query and hash", () => {
    expect(safeRedirectPath("/tweets/123?tab=replies#top")).toBe(
      "/tweets/123?tab=replies#top"
    )
    expect(safeRedirectPath("/settings")).toBe("/settings")
  })

  it("drops anything that isn't a string", () => {
    expect(safeRedirectPath(undefined)).toBeUndefined()
    expect(safeRedirectPath(42)).toBeUndefined()
    expect(safeRedirectPath({ to: "/" })).toBeUndefined()
  })

  it("drops absolute and protocol-relative URLs, so sign-in can't send you off-site", () => {
    expect(safeRedirectPath("https://evil.example/")).toBeUndefined()
    expect(safeRedirectPath("//evil.example/")).toBeUndefined()
    expect(safeRedirectPath("/\\evil.example")).toBeUndefined()
    expect(safeRedirectPath("/\t/evil.example")).toBeUndefined()
    expect(safeRedirectPath("javascript:alert(1)")).toBeUndefined()
    expect(safeRedirectPath("settings")).toBeUndefined()
  })

  it("never sends you back to the sign-in or sign-up screen", () => {
    expect(safeRedirectPath("/sign-in")).toBeUndefined()
    expect(safeRedirectPath("/sign-up?redirect=/x")).toBeUndefined()
  })
})
