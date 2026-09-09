import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  CirclePause,
  ClipboardList,
  Clock3,
  CreditCard,
  Database,
  Download,
  Landmark,
  LayoutGrid,
  Package,
  Plus,
  Ruler,
  Tags,
  Upload,
  Users,
} from 'lucide-react'
import cashierIcon from '../../assets/icons/cashier.png'
import cashAccountsIcon from '../../assets/icons/cash-accounts.png'
import cartonIcon from '../../assets/icons/carton.png'
import penIcon from '../../assets/icons/pen.png'
import truckIcon from '../../assets/icons/truck.png'
import walletIcon from '../../assets/icons/wallet.png'
import { useCountUp } from '../../hooks/useCountUp'
import './masterRegistries.css'

type RegistryCard = {
  title: string
  description: string
  action: string
  icon: LucideIcon
  imageIcon?: string
  tone: string
}

const registryCards: RegistryCard[] = [
  {
    title: 'Customers',
    description: 'People and businesses that buy from you.',
    action: 'Manage Customers',
    icon: Users,
    imageIcon: cashierIcon,
    tone: 'from-sky-500 to-blue-500',
  },
  {
    title: 'Suppliers',
    description: 'People and businesses you buy goods or services from.',
    action: 'Manage Suppliers',
    icon: Package,
    imageIcon: truckIcon,
    tone: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Products & Services',
    description: 'Items and services you sell, purchase, or keep in stock.',
    action: 'Manage Products & Services',
    icon: Package,
    imageIcon: cartonIcon,
    tone: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Product Categories',
    description: 'Organize products and services for easier setup, search, and reporting.',
    action: 'Manage Categories',
    icon: Tags,
    tone: 'from-indigo-500 to-blue-600',
  },
  {
    title: 'Units of Measure',
    description: 'Define how items are counted, measured, purchased, or sold.',
    action: 'Manage Units',
    icon: Ruler,
    tone: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Cash Accounts',
    description: 'Set up cash boxes, bank accounts, digital wallets, and other accounts.',
    action: 'Manage Cash Accounts',
    icon: Landmark,
    imageIcon: cashAccountsIcon,
    tone: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Expense Categories',
    description: 'Organize expenses such as rent, utilities, transport, and supplies.',
    action: 'Manage Expense Categories',
    icon: Tags,
    imageIcon: walletIcon,
    tone: 'from-purple-500 to-fuchsia-500',
  },
  {
    title: 'Payment Methods',
    description: 'Define how customers pay and how your business makes payments.',
    action: 'Manage Payment Methods',
    icon: CreditCard,
    imageIcon: penIcon,
    tone: 'from-fuchsia-500 to-purple-600',
  },
]

const quickActions = [
  'Add Customer',
  'Add Supplier',
  'Add Product or Service',
  'Add Cash Account',
  'Add Expense Category',
  'Add Units of Measure',
  'Add Product Category',
  'Add Payment Method',
]

const registrySummary = [
  { label: 'Total Records', value: 5101, icon: Database, tone: 'text-sky-600 bg-sky-50' },
  { label: 'Active Records', value: 4836, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
  { label: 'Inactive Records', value: 265, icon: CirclePause, tone: 'text-amber-500 bg-amber-50' },
  { label: 'Records Updated Today', value: 12, icon: Clock3, tone: 'text-violet-600 bg-violet-50' },
]

function AnimatedSummaryNumber({ target, delay }: { target: number; delay: number }) {
  const value = useCountUp(target, { delay, duration: 900, isCurrency: true })

  return <p className="text-base font-bold leading-none text-slate-900">{value}</p>
}

export function MasterRegistriesPage() {
  return (
    <div className="w-full space-y-3.5 pb-4">
      <header className="animate-master-registries-header flex items-center gap-2.5 pt-0.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-violet-100 text-violet-600 sm:size-9">
          <LayoutGrid aria-hidden="true" className="size-5 sm:size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Master Registries</h1>
          <p className="text-xs text-slate-600 sm:text-[13px]">Manage the shared business records used throughout SimpleBIZ.</p>
        </div>
      </header>

      <div className="animate-master-registries-grid grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="space-y-3.5">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Master registry workspaces">
            {registryCards.map((card) => {
              const Icon = card.icon

              return (
                <article className={`flex min-h-[230px] flex-col rounded-xl bg-gradient-to-br ${card.tone} p-3.5 text-center text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[250px] sm:p-4`} key={card.title}>
                  <div className="mx-auto flex h-20 w-full items-center justify-center pt-1 sm:h-24">
                    {card.imageIcon ? (
                      <span className="grid size-20 place-items-center rounded-full bg-white/90 shadow-sm sm:size-24">
                        <img alt="" aria-hidden="true" className="size-16 object-contain sm:size-20" src={card.imageIcon} />
                      </span>
                    ) : (
                      <span className="grid size-20 place-items-center rounded-full bg-white/90 shadow-sm sm:size-24">
                        <Icon aria-hidden="true" className="size-11 text-slate-700 sm:size-12" strokeWidth={1.8} />
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2.5 text-sm font-bold tracking-tight sm:text-[15px]">{card.title}</h2>
                  <p className="mt-1 line-clamp-2 min-h-8 text-[10.5px] leading-relaxed text-white/95">{card.description}</p>
                  <button className="mt-3 rounded-lg border border-slate-300/80 bg-white px-2.5 py-1.5 text-center text-[11.5px] font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" type="button">
                    {card.action}
                  </button>
                </article>
              )
            })}
          </section>

          <section className="animate-master-registries-summary rounded-xl border border-sky-400 bg-white/60 px-3.5 py-2.5 shadow-sm" aria-labelledby="registry-summary-title">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1.5">
              <ClipboardList aria-hidden="true" className="size-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900" id="registry-summary-title">Registry Summary</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200/80 sm:grid-cols-4">
              {registrySummary.map((summary, index) => {
                const Icon = summary.icon

                return (
                  <div className="flex items-center gap-2 px-3 py-3 first:pl-0 sm:first:pl-0" key={summary.label}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${summary.tone}`}>
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <AnimatedSummaryNumber delay={280 + index * 80} target={summary.value} />
                      <p className="mt-1 text-[9px] leading-tight text-slate-500">{summary.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-3.5" aria-label="Registry quick actions and data tools">
          <section className="rounded-xl border border-sky-400 bg-white/75 p-2.5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 border-b border-slate-200 pb-2">
              <CreditCard aria-hidden="true" className="size-4 text-slate-800" />
              <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="space-y-1.5">
              {quickActions.map((action, index) => (
                <button className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[10px] font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${index < 3 ? 'bg-sky-500 hover:bg-sky-600' : 'bg-violet-500 hover:bg-violet-600'}`} key={action} type="button">
                  <Plus aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.3} />
                  <span>{action}</span>
                </button>
              ))}
            </div>
            <button className="mt-2 w-full text-right text-[10px] font-medium text-sky-600 hover:text-sky-800" type="button">View all</button>
          </section>

          <section className="rounded-xl border border-sky-400 bg-white/75 p-2.5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 border-b border-slate-200 pb-2">
              <ClipboardList aria-hidden="true" className="size-4 text-slate-800" />
              <h2 className="text-sm font-semibold text-slate-900">Data Tools</h2>
            </div>
            <div className="space-y-1.5">
              <button className="flex w-full items-center gap-2 rounded-md border border-sky-400 bg-white px-2.5 py-1.5 text-left text-[10px] font-medium text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" type="button">
                <Upload aria-hidden="true" className="size-3.5" /> Import Records
              </button>
              <button className="flex w-full items-center gap-2 rounded-md border border-sky-400 bg-white px-2.5 py-1.5 text-left text-[10px] font-medium text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" type="button">
                <Download aria-hidden="true" className="size-3.5" /> Export Records
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
