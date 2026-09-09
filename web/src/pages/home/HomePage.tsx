import welcomeIcon from '../../assets/images/home/welcome-icon.png'
import './home.css'
import { FeaturedCard } from './components/FeaturedCard'
import { LearnSimpleBizCard } from './components/LearnSimpleBizCard'
import { GettingStartedCard } from './components/GettingStartedCard'
import { YourListingCard } from './components/YourListingCard'
import { BusinessSpotlightCard } from './components/BusinessSpotlightCard'
import { BusinessDirectoryCard } from './components/BusinessDirectoryCard'
import { MastermindCard } from './components/MastermindCard'

export function HomePage() {
  return (
    <div className="w-full space-y-3.5 pb-2 lg:max-w-[83%] xl:max-w-[81%] 2xl:max-w-[1300px]">
      {/* Page Header */}
      <header className="animate-home-header flex items-center gap-2.5 pt-0.5">
        <img
          src={welcomeIcon}
          alt=""
          aria-hidden="true"
          className="size-8 shrink-0 object-contain sm:size-9"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Welcome to SimpleBIZ
          </h1>
          <p className="text-xs text-slate-600 sm:text-[13px]">
            Stay informed with the latest updates, helpful guidance, and selected offers for your business.
          </p>
        </div>
      </header>

      {/* Row 1: Featured, Learn SimpleBIZ, Getting Started */}
      <section
        className="animate-home-row-1 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.85fr_1fr_1.1fr]"
        aria-label="Highlights and Getting Started"
      >
        <FeaturedCard />
        <LearnSimpleBizCard />
        <GettingStartedCard />
      </section>

      {/* Row 2: Your Listing & Business Spotlight */}
      <section
        className="animate-home-row-2 grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_3.35fr]"
        aria-label="Business Directory and Spotlight"
      >
        <YourListingCard />
        <BusinessSpotlightCard />
      </section>

      {/* Row 3: Business Directory & Mastermind */}
      <section
        className="animate-home-row-3 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.9fr_1.1fr]"
        aria-label="Business Directory and Mastermind Network"
      >
        <BusinessDirectoryCard />
        <MastermindCard />
      </section>
    </div>
  )
}
