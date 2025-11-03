/**
 * 무한 스크롤 훅
 */

import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  onIntersect: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll({
  onIntersect,
  hasNextPage = false,
  isFetchingNextPage = false,
  threshold = 0.1,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onIntersect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, onIntersect, threshold, rootMargin])

  return { observerTarget }
}
