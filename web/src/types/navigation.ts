import type { LucideIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

export type NavigationItem = {
  label: string
  path: string
  icon?: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>
  imageIcon?: string
  description: string
  isComingSoon?: boolean
}

