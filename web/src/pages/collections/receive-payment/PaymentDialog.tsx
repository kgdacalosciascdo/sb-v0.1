import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { lockBodyScroll, unlockBodyScroll } from '../../purchases/purchase-entry/PurchaseDialog'

export function PaymentDialog({
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
      className={`collection-dialog rounded-2xl border border-[#8ec7df] bg-[#e0f6fd] p-0 shadow-2xl text-[#0c3761] backdrop:bg-[#0b294e]/50 fixed inset-0 m-auto max-h-[90dvh] overflow-y-auto overscroll-contain ${className || 'w-[min(560px,calc(100vw-24px))]'}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between bg-[#e0f6fd] px-5 sm:px-6 py-3.5 border-b border-[#c4dfe9]">
          <h2 className="text-base sm:text-lg font-bold text-[#0c3761]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-500 hover:text-slate-800 transition p-1 rounded-md hover:bg-[#bae6fd]/50 cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>
      )}
      {children}
    </dialog>,
    document.body,
  )
}
