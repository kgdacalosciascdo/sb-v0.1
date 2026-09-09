import { useState, useEffect } from 'react'

interface UseCountUpOptions {
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  isCurrency?: boolean
  isNegative?: boolean
}

export function useCountUp(
  target: number,
  {
    duration = 1000,
    delay = 0,
    prefix = '',
    suffix = '',
    isCurrency = false,
    isNegative = false,
  }: UseCountUpOptions = {}
): string {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    let frameId: number

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))

        if (progress < 1) {
          frameId = requestAnimationFrame(step)
        } else {
          setCount(target)
        }
      }
      frameId = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frameId)
    }
  }, [target, duration, delay])

  const formattedValue = isCurrency
    ? count.toLocaleString('en-US')
    : count.toString()

  if (isNegative) {
    return `(${prefix}${formattedValue}${suffix})`
  }

  return `${prefix}${formattedValue}${suffix}`
}
