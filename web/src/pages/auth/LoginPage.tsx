import { ArrowUpRight, Palmtree, ShieldCheck } from 'lucide-react'
import { LoginForm } from '../../features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-brand-700 px-10 py-10 text-white lg:flex lg:flex-col xl:px-20">
        <div aria-hidden="true" className="absolute -right-32 -top-32 size-96 rounded-full border-[3rem] border-brand-500/25" />
        <div aria-hidden="true" className="absolute -bottom-48 -left-24 size-[34rem] rounded-full border-[4rem] border-brand-800/30" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 text-brand-100">
            <Palmtree aria-hidden="true" size={27} />
          </span>
          <span className="text-2xl font-semibold tracking-tight">Simple<span className="text-brand-100">BIZ</span><sup className="ml-0.5 align-super text-[0.6rem]">1</sup></span>
        </div>
        <div className="relative my-auto max-w-xl py-16">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-brand-200">SimpleBIZ One</p>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Know your business. Move it forward.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-brand-100/90">A clear, dependable workspace for entrepreneurs to understand what is happening and decide what to do next.</p>
          <div className="mt-10 flex items-center gap-3 text-sm font-medium text-brand-100">
            <ShieldCheck aria-hidden="true" size={19} />
            <span>Built around clear records and responsible action</span>
          </div>
        </div>
        <p className="relative text-xs text-brand-100/70">One platform for the everyday work of running a business.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="inline-flex items-center gap-2 text-brand-700">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-100"><Palmtree aria-hidden="true" size={23} /></span>
              <span className="text-xl font-bold">Simple<span className="text-brand-500">BIZ</span><sup className="ml-0.5 align-super text-[0.5rem]">1</sup></span>
            </div>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">Sign in to SimpleBIZ</h2>
            <p className="mt-3 text-sm leading-6 text-ink-500">Pick up where you left off and keep your business moving.</p>
          </div>
          <LoginForm />
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-900">
            <ArrowUpRight aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
            <p><span className="font-semibold">Preview mode:</span> any valid-looking email and non-empty password opens the shell. No password is stored and Laravel authentication is intentionally deferred.</p>
          </div>
          <p className="mt-8 text-center text-xs text-ink-500">© 2026 SimpleBIZ Systems</p>
        </div>
      </section>
    </div>
  )
}
