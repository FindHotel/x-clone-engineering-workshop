import { describe, expect, it } from "vitest"

import { formatHandle } from "@/lib/user"

describe("formatHandle", () => {
  it("adds the @ to a bare handle", () => {
    expect(formatHandle("ada")).toBe("@ada")
  })

  it("keeps a single @ when the handle already has one", () => {
    expect(formatHandle("@ada")).toBe("@ada")
  })
})
