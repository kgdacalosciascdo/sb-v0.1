import type { LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  description: string
  isComingSoon?: boolean
}
