import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function PaymentDialog({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return createPortal(
    <dialog
      ref={ref}
      className="collection-dialog"
      aria-label={title}
      onCancel={onClose}
    >
      <div className="collection-dialog-heading">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close dialog">
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>,
    document.body,
  )
}
