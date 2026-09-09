import { Lightbulb } from 'lucide-react'
import learnSetupImg from '../../../assets/images/home/learn-setup.png'
import learnGuideImg from '../../../assets/images/home/learn-guide.png'

export function LearnSimpleBizCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#60a5fa] bg-[#a5d0fa] p-4 shadow-xs transition hover:shadow-sm">
      <div>
        {/* Header */}
        <div className="mb-2.5 flex items-center gap-2">
          <Lightbulb aria-hidden="true" className="size-4 text-[#00a2e8]" />
          <h2 className="text-[14px] font-bold text-[#1e40af]">Learn SimpleBIZ</h2>
        </div>

        {/* Video Tutorial Cards */}
        <div className="space-y-2.5">
          <a
            href="#tutorial-setup"
            className="group block overflow-hidden rounded-lg border border-blue-300 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            title="Learn to setup SimpleBIZ in 5 mins"
          >
            <img
              src={learnSetupImg}
              alt="Learn to setup SimpleBIZ in 5 mins"
              className="h-auto w-full object-cover transition group-hover:brightness-[1.02]"
            />
          </a>

          <a
            href="#tutorial-workspaces"
            className="group block overflow-hidden rounded-lg border border-blue-300 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            title="SB1 SimpleBIZ One - Basic Guide - The 7 Workspaces of SB1"
          >
            <img
              src={learnGuideImg}
              alt="SimpleBIZ One Basic Guide - The 7 Workspaces of SB1"
              className="h-auto w-full object-cover transition group-hover:brightness-[1.02]"
            />
          </a>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-2 text-right">
        <a
          href="#all-tutorials"
          className="inline-flex items-center text-[11.5px] font-semibold text-[#1e40af] transition hover:text-blue-950 hover:underline"
        >
          view all &gt;
        </a>
      </div>
    </div>
  )
}
