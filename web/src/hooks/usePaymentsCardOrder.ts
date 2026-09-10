import { useState, useEffect, useCallback } from 'react'

export type PaymentsCardId =
  | 'needs-attention'
  | 'overview'
  | 'more-actions'
  | 'recent-activity'
  | 'reports'
  | 'records-ledgers'

export const DEFAULT_PAYMENTS_CARD_ORDER: PaymentsCardId[] = [
  'needs-attention',
  'overview',
  'more-actions',
  'recent-activity',
  'reports',
  'records-ledgers',
]

const STORAGE_KEY = 'simplebiz_payments_card_order'

export function usePaymentsCardOrder() {
  const [cardOrder, setCardOrder] = useState<PaymentsCardId[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as PaymentsCardId[]
        const isValid =
          Array.isArray(parsed) &&
          parsed.length === DEFAULT_PAYMENTS_CARD_ORDER.length &&
          DEFAULT_PAYMENTS_CARD_ORDER.every((id) => parsed.includes(id))
        if (isValid) {
          return parsed
        }
      }
    } catch {
      // Fallback to default if storage fails
    }
    return DEFAULT_PAYMENTS_CARD_ORDER
  })

  const [draggedId, setDraggedId] = useState<PaymentsCardId | null>(null)
  const [dragOverId, setDragOverId] = useState<PaymentsCardId | null>(null)

  // Save to localStorage when order changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cardOrder))
    } catch {
      // Ignore storage errors
    }
  }, [cardOrder])

  const isCustomOrder = JSON.stringify(cardOrder) !== JSON.stringify(DEFAULT_PAYMENTS_CARD_ORDER)

  const moveCard = useCallback((sourceId: PaymentsCardId, targetId: PaymentsCardId) => {
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
    setCardOrder(DEFAULT_PAYMENTS_CARD_ORDER)
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
