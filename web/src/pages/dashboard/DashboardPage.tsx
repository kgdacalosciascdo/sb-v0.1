import { CircleCheck, Clock3, LayoutDashboard, Sparkles } from 'lucide-react'

const foundationItems = [
  'Responsive application shell',
  'Protected dashboard route',
  'Typed module navigation',
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
            <LayoutDashboard aria-hidden="true" size={15} />
            Workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">Welcome to SimpleBIZ One. Your business overview will live here.</p>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]" aria-labelledby="foundation-title">
        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-panel sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Sparkles aria-hidden="true" size={24} />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-ink-900" id="foundation-title">Dashboard foundation ready</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-500">This is a neutral placeholder for the future Dashboard module. Governed business snapshots, attention items, activity, and actions will be connected in a later phase.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-ink-500">
            <Clock3 aria-hidden="true" size={16} />
            <span>Module implementation intentionally deferred</span>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-panel sm:p-8">
          <h2 className="text-base font-semibold text-ink-900">Foundation checks</h2>
          <ul className="mt-5 space-y-4">
            {foundationItems.map((item) => (
              <li className="flex items-center gap-3 text-sm text-ink-700" key={item}>
                <CircleCheck aria-hidden="true" className="shrink-0 text-emerald-600" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
