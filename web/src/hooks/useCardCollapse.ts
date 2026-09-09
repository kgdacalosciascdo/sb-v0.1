import { useState, useRef, useCallback } from 'react'

/**
 * Custom hook for smooth, GPU-accelerated card collapse and uncollapse animations
 * while maintaining equal card heights across CSS Grid rows by default.
 *
 * - When expanded and not animating: uses `h-full` to stretch to equal height with sibling cards.
 * - When collapsed or during transition: uses `h-auto self-start` so height animates smoothly
 *   in real time without white-box snapping or layout jumps.
 */
export function useCardCollapse(defaultExpanded = true) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggle = useCallback(() => {
    setIsAnimating(true)
    setIsExpanded((prev) => !prev)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
    }, 320)
  }, [])

  // Lock to h-full when expanded and idle so cards match row height by default.
  // While animating or when collapsed, use self-start for continuous smooth height tracking.
  const isFullHeight = isExpanded && !isAnimating

  return {
    isExpanded,
    isFullHeight,
    toggle,
  }
}
