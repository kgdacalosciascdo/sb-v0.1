import { ArrowLeft, Clock3, Construction, Info } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { allNavigationItems } from '../routes/navigation'

export function ComingSoonPage() {
  const location = useLocation()
  const item = allNavigationItems.find((navigationItem) => navigationItem.path === location.pathname)
  const label = item?.label ?? 'This workspace'

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-3xl items-center justify-center py-10">
      <section className="w-full rounded-2xl border border-brand-200 bg-white p-8 text-center shadow-panel sm:p-12">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <Construction aria-hidden="true" size={30} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Foundation phase</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{label}</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink-500">This workspace is reserved for its governed module implementation. It is not part of the initial application foundation.</p>
        <div className="mx-auto mt-7 flex max-w-md items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-left text-xs leading-5 text-brand-900">
          <Info aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
          <span>{item?.description ?? 'Module functionality will be introduced in a later phase.'}</span>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200" to="/dashboard">
            <ArrowLeft aria-hidden="true" size={17} />
            Back to dashboard
          </Link>
          <span className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-500">
            <Clock3 aria-hidden="true" size={17} />
            Coming in a later phase
          </span>
        </div>
      </section>
    </div>
  )
}
