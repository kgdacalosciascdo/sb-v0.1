import { useEffect } from 'react'
import { create } from 'zustand'
import { purchaseRequest, type Overview } from './api'

let inFlight: Promise<void> | null = null
const useOverviewStore = create<{
  data: Overview | null
  error: string
  loading: boolean
  refresh: () => Promise<void>
}>((set) => ({
  data: null,
  error: '',
  loading: true,
  refresh: () => {
    if (inFlight) return inFlight
    set({ loading: true, error: '' })
    inFlight = purchaseRequest<{ data: Overview }>('overview')
      .then((r) => set({ data: r.data }))
      .catch((e) => set({ error: e.message, data: null }))
      .finally(() => {
        inFlight = null
        set({ loading: false })
      })
    return inFlight
  },
}))
export function usePurchaseOverview() {
  const store = useOverviewStore()
  const refresh = store.refresh
  useEffect(() => {
    void refresh()
  }, [refresh])
  return store
}
