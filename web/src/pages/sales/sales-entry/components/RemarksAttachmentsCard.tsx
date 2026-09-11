import { useRef } from 'react'
import { Paperclip, X } from 'lucide-react'
import messageIcon from '../../../../assets/svg/message.svg'

interface RemarksAttachmentsCardProps {
  remarks: string
  attachments: { name: string; size: number }[]
  onRemarksChange: (remarks: string) => void
  onAddAttachment: (file: { name: string; size: number }) => void
  onRemoveAttachment: (index: number) => void
}

export function RemarksAttachmentsCard({
  remarks,
  attachments,
  onRemarksChange,
  onAddAttachment,
  onRemoveAttachment,
}: RemarksAttachmentsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      onAddAttachment({
        name: file.name,
        size: file.size,
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7] h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <img src={messageIcon} alt="" className="size-7 shrink-0 object-contain" />
        <h2 className="text-[14.5px] font-bold text-[#134c68] tracking-tight">Remarks &amp; Attachments</h2>
      </div>

      {/* Content */}
      <div className="space-y-2.5">
        {/* Remarks Textarea */}
        <div className="relative">
          <textarea
            value={remarks}
            maxLength={500}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="e.g. delivery instructions, internal notes..."
            rows={2}
            className="w-full rounded-md border-[1.5px] border-[#63c4ed] bg-white px-3 py-2 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 resize-none pb-5"
          />
          <span className="absolute right-2.5 bottom-2 text-[10.5px] font-medium text-slate-400">
            {remarks.length}/500
          </span>
        </div>

        {/* Attachments Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Paperclip className="size-4 text-slate-400 shrink-0" />
            <span className="text-[11.5px] font-medium text-slate-600">Attachments:</span>
            <span className="text-[11px] text-slate-400">[Max 10 MB per file]</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer self-end sm:self-auto"
          >
            Attach Files
          </button>
        </div>

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {attachments.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-white border border-[#63c4ed] px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                <Paperclip className="size-3 text-slate-400" />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(idx)}
                  className="rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
