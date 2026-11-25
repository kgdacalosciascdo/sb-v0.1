import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

let openModalsCount = 0
let scrollY = 0

export function lockBodyScroll() {
  if (openModalsCount === 0) {
    scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.dataset.prevOverflow = document.body.style.overflow || ''
    document.body.dataset.prevPosition = document.body.style.position || ''
    document.body.dataset.prevTop = document.body.style.top || ''
    document.body.dataset.prevWidth = document.body.style.width || ''
    document.body.dataset.prevPaddingRight = document.body.style.paddingRight || ''
    document.documentElement.dataset.prevOverflow = document.documentElement.style.overflow || ''

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }
  openModalsCount++
}

export function unlockBodyScroll() {
  openModalsCount = Math.max(0, openModalsCount - 1)
  if (openModalsCount === 0) {
    const prevTop = document.body.style.top
    document.documentElement.style.overflow = document.documentElement.dataset.prevOverflow || ''
    document.body.style.overflow = document.body.dataset.prevOverflow || ''
    document.body.style.position = document.body.dataset.prevPosition || ''
    document.body.style.top = document.body.dataset.prevTop || ''
    document.body.style.width = document.body.dataset.prevWidth || ''
    document.body.style.paddingRight = document.body.dataset.prevPaddingRight || ''

    delete document.documentElement.dataset.prevOverflow
    delete document.body.dataset.prevOverflow
    delete document.body.dataset.prevPosition
    delete document.body.dataset.prevTop
    delete document.body.dataset.prevWidth
    delete document.body.dataset.prevPaddingRight

    const restoredY = prevTop ? Math.abs(parseInt(prevTop, 10)) : scrollY
    window.scrollTo(0, restoredY)
  }
}

export function PurchaseDialog({
  title,
  onClose,
  children,
  className = '',
  hideHeader = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
  hideHeader?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    lockBodyScroll()

    const handleWheel = (e: WheelEvent) => {
      if (!dialog) return
      const rect = dialog.getBoundingClientRect()
      const inDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (!inDialog) {
        e.preventDefault()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!dialog) return
      const rect = dialog.getBoundingClientRect()
      const touch = e.touches[0]
      if (touch) {
        const inDialog =
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        if (!inDialog) {
          e.preventDefault()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove)
      unlockBodyScroll()
      dialog?.close()
    }
  }, [])

  return createPortal(
    <dialog
      ref={ref}
      className={`rounded-xl border-2 border-[#64a1bf] bg-[#e0f6fd] p-0 shadow-2xl text-[#0c3761] backdrop:bg-[#0b294e]/50 fixed inset-0 m-auto max-h-[92dvh] overflow-y-auto overscroll-contain ${className || 'w-[min(430px,calc(100vw-24px))]'}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between bg-[#e0f6fd] px-6 py-4 border-b border-[#c4dfe9]">
          <h2 className="text-lg font-bold text-[#0c3761]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      )}
      {children}
    </dialog>,
    document.body,
  )
}
