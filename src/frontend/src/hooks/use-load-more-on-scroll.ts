import { useEffect, useRef } from "react"

/**
 * Calls `loadMore` whenever the returned ref's element scrolls near the
 * viewport — put it at the end of a list for infinite scroll.
 */
export function useLoadMoreOnScroll<T extends Element>(
  loadMore: () => void,
  enabled: boolean
) {
  const ref = useRef<T>(null)
  const loadMoreRef = useRef(loadMore)

  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore])

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMoreRef.current()
      },
      { rootMargin: "400px 0px" }
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [enabled])

  return ref
}
