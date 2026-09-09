import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  CircleUserRound,
  FileText,
  KeyRound,
  Landmark,
  List,
  PlugZap,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Workflow,
} from 'lucide-react'
import './settings.css'

type SettingsCard = {
  title: string
  description: string
  action: string
  icon: LucideIcon
}

const settingsCards: SettingsCard[] = [
  {
    title: 'Account & Subscription',
    description: 'Manage your profile, plan, usage, billing, and connected SimpleBIZ products.',
    action: 'Account & Billing',
    icon: CircleUserRound,
  },
  {
    title: 'Business Setup',
    description: 'Configure your company profile, currency, locale, fiscal year, and business defaults.',
    action: 'Configure Business',
    icon: Landmark,
  },
  {
    title: 'Users & Access',
    description: 'Add users and control their roles, permissions, and access.',
    action: 'Manage Users & Access',
    icon: KeyRound,
  },
  {
    title: 'Finance & Documents',
    description: 'Configure accounting, taxes, document numbering, and financial defaults.',
    action: 'Configure Finance & Documents',
    icon: FileText,
  },
  {
    title: 'Workflow & Approvals',
    description: 'Set approval requirements and supported transaction workflows.',
    action: 'Manage Workflows',
    icon: Workflow,
  },
  {
    title: 'Modules & Preferences',
    description: 'Enable modules and manage general operating preferences.',
    action: 'Manage Preferences',
    icon: SlidersHorizontal,
  },
  {
    title: 'Notifications',
    description: 'Control in-app and email alerts for each user.',
    action: 'Manage Notifications',
    icon: Bell,
  },
  {
    title: 'Data & Integrations',
    description: 'Import, export, and connect SimpleBIZ with supported services.',
    action: 'Manage Data & Integrations',
    icon: PlugZap,
  },
  {
    title: 'Security & Audit',
    description: 'Manage MFA, sessions, login history, and administrative audit records.',
    action: 'Review Security & Audit',
    icon: ShieldCheck,
  },
]

const recentChanges = [
  ['Maria invited a new user', 'by Juan dela Cruz · 12 minutes ago'],
  ['MFA enabled for Juan dela Cruz', 'by Juan dela Cruz · 12 minutes ago'],
  ['Fiscal year changed', 'by Juan dela Cruz · 12 minutes ago'],
  ['Invoice numbering updated', 'by Juan dela Cruz · 12 minutes ago'],
  ['Email notifications disabled', 'by Juan dela Cruz · 12 minutes ago'],
  ['Integration connected', 'by Juan dela Cruz · 12 minutes ago'],
]

export function SettingsPage() {
  return (
    <div className="w-full space-y-3.5 pb-4">
      <header className="animate-settings-header flex items-center gap-2.5 pt-0.5">
        <Settings aria-hidden="true" className="size-8 shrink-0 text-slate-600 sm:size-9" strokeWidth={2} />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Settings & Administration</h1>
          <p className="text-xs text-slate-600 sm:text-[13px]">Manage your business, users, security, and system settings.</p>
        </div>
      </header>

      <section className="animate-settings-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Settings and administration workspaces">
        {settingsCards.map((card) => {
          const Icon = card.icon

          return (
            <article className="flex min-h-[290px] flex-col rounded-xl border border-[#c2e2ee] bg-[#d5edf7] p-4.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ddf2fa] sm:min-h-[310px] sm:p-5" key={card.title}>
              <Icon aria-hidden="true" className="mx-auto size-14 text-[#3973c6] sm:size-16" strokeWidth={1.9} />
              <h2 className="mt-3 text-[16px] font-bold tracking-tight text-slate-800 sm:text-[17px]">{card.title}</h2>
              <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[11.5px] leading-relaxed text-slate-500">{card.description}</p>
              <button className="mt-4 rounded-lg border border-[#3973c6] bg-white px-3 py-2 text-[12.5px] font-bold text-slate-800 shadow-sm transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3973c6]" type="button">
                {card.action}
              </button>
            </article>
          )
        })}

        <aside className="min-h-[290px] rounded-xl bg-white/75 p-3.5 shadow-sm xl:col-start-5 xl:row-start-2 sm:min-h-[310px]" aria-labelledby="recent-changes-title">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <List aria-hidden="true" className="size-4 text-slate-800" />
            <h2 className="text-sm font-semibold text-slate-900" id="recent-changes-title">Recent Changes</h2>
          </div>
          <ul className="mt-2.5 space-y-2">
            {recentChanges.map(([title, detail]) => (
              <li key={title}>
                <p className="text-[10px] font-semibold leading-tight text-slate-700">{title}</p>
                <p className="mt-0.5 text-[9px] leading-tight text-slate-400">{detail}</p>
              </li>
            ))}
          </ul>
          <button className="mt-2 w-full text-right text-[10px] font-medium text-sky-600 hover:text-sky-800" type="button">View all</button>
        </aside>
      </section>
    </div>
  )
}
