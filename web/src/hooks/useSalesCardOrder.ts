import { useState, useEffect, useCallback } from 'react'

export type SalesCardId =
  | 'needs-attention'
  | 'overview'
  | 'more-actions'
  | 'recent-activity'
  | 'reports'
  | 'records-ledgers'

export const DEFAULT_SALES_CARD_ORDER: SalesCardId[] = [
  'needs-attention',
  'overview',
  'more-actions',
  'recent-activity',
  'reports',
  'records-ledgers',
]

const STORAGE_KEY = 'simplebiz_sales_card_order'

export function useSalesCardOrder() {
  const [cardOrder, setCardOrder] = useState<SalesCardId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as SalesCardId[]
        const isValid =
          Array.isArray(parsed) &&
          parsed.length === DEFAULT_SALES_CARD_ORDER.length &&
          DEFAULT_SALES_CARD_ORDER.every((id) => parsed.includes(id))
        if (isValid) {
          return parsed
        }
      }
    } catch {
      // Fallback to default if storage fails
    }
    return DEFAULT_SALES_CARD_ORDER
  })

  const [draggedId, setDraggedId] = useState<SalesCardId | null>(null)
  const [dragOverId, setDragOverId] = useState<SalesCardId | null>(null)

  // Save to localStorage when order changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cardOrder))
    } catch {
      // Ignore storage errors
    }
  }, [cardOrder])

  const isCustomOrder = JSON.stringify(cardOrder) !== JSON.stringify(DEFAULT_SALES_CARD_ORDER)

  const moveCard = useCallback((sourceId: SalesCardId, targetId: SalesCardId) => {
    if (sourceId === targetId) return

    setCardOrder((prev) => {
      const newOrder = [...prev]
      const sourceIndex = newOrder.indexOf(sourceId)
      const targetIndex = newOrder.indexOf(targetId)

      if (sourceIndex === -1 || targetIndex === -1) return prev

      // Remove from source and insert at target
      const [removed] = newOrder.splice(sourceIndex, 1)
      newOrder.splice(targetIndex, 0, removed)
      return newOrder
    })
  }, [])

  const resetOrder = useCallback(() => {
    setCardOrder(DEFAULT_SALES_CARD_ORDER)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
  }, [])

  return {
    cardOrder,
    draggedId,
    dragOverId,
    isCustomOrder,
    setDraggedId,
    setDragOverId,
    moveCard,
    resetOrder,
  }
}
