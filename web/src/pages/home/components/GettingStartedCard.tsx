import { useState } from 'react'
import { CheckCircle2, ChevronRight, Rocket } from 'lucide-react'

interface StepItem {
  id: string
  label: string
  completed: boolean
}

const INITIAL_STEPS: StepItem[] = [
  { id: 'company', label: 'Company setup', completed: true },
  { id: 'cash-accounts', label: 'Configure cash accounts', completed: true },
  { id: 'customers', label: 'Add customers', completed: false },
  { id: 'suppliers', label: 'Add suppliers', completed: false },
  { id: 'products', label: 'Add products', completed: false },
  { id: 'opening-balances', label: 'Enter opening balances', completed: false },
  { id: 'roles', label: 'Users and roles', completed: false },
]

export function GettingStartedCard() {
  const [steps, setSteps] = useState<StepItem[]>(INITIAL_STEPS)

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    )
  }

  const completedCount = steps.filter((s) => s.completed).length

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#74c990] bg-[#caedd6] p-4 shadow-xs transition hover:shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Rocket aria-hidden="true" className="size-4.5 text-[#15803d]" />
        <h2 className="text-[15px] font-bold text-[#15803d]">Getting Started</h2>
      </div>

      {/* Checklist Items Distributed to Occupy All Vertical Space */}
      <ul className="flex flex-1 flex-col justify-between py-1" role="list">
        {steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => toggleStep(step.id)}
              className="group flex w-full items-center justify-between rounded-lg px-1.5 py-1 text-left transition hover:bg-emerald-200/50"
            >
              <div className="flex items-center gap-2">
                {step.completed ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4.5 shrink-0 text-[#16a34a]"
                    strokeWidth={2.2}
                  />
                ) : (
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4.5 shrink-0 text-[#38bdf8]"
                    strokeWidth={1.8}
                  />
                )}
                <span
                  className={`text-[12px] leading-tight ${step.completed
                    ? 'font-medium text-slate-900'
                    : 'text-slate-800'
                    }`}
                >
                  {step.label}
                </span>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-800"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Counter Footer */}
      <div className="pt-2 text-center text-[11px] text-slate-700">
        {completedCount} of {steps.length} completed
      </div>
    </div>
  )
}
