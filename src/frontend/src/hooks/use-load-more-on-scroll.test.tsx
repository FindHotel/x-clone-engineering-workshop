import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useLoadMoreOnScroll } from "@/hooks/use-load-more-on-scroll"

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void

let observers: { callback: Callback; disconnect: ReturnType<typeof vi.fn> }[] = []

beforeEach(() => {
  observers = []
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect = vi.fn()
      constructor(callback: Callback) {
        observers.push({ callback, disconnect: this.disconnect })
      }
      observe() {}
    }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function Sentinel({ loadMore, enabled }: { loadMore: () => void; enabled: boolean }) {
  const ref = useLoadMoreOnScroll<HTMLDivElement>(loadMore, enabled)
  return <div ref={ref} />
}

describe("useLoadMoreOnScroll", () => {
  it("loads more when the sentinel scrolls into view", () => {
    const loadMore = vi.fn()
    render(<Sentinel loadMore={loadMore} enabled />)

    observers[0].callback([{ isIntersecting: false }])
    expect(loadMore).not.toHaveBeenCalled()

    observers[0].callback([{ isIntersecting: true }])
    expect(loadMore).toHaveBeenCalledOnce()
  })

  it("doesn't watch while disabled", () => {
    render(<Sentinel loadMore={vi.fn()} enabled={false} />)
    expect(observers).toHaveLength(0)
  })

  it("stops watching once disabled", () => {
    const { rerender } = render(<Sentinel loadMore={vi.fn()} enabled />)
    rerender(<Sentinel loadMore={vi.fn()} enabled={false} />)
    expect(observers[0].disconnect).toHaveBeenCalled()
  })
})
