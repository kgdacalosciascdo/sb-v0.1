import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import spotlightOtsoImg from '../../../assets/images/home/spotlight-otso.png'
import spotlightXyzImg from '../../../assets/images/home/spotlight-xyz.png'
import spotlightFoodImg from '../../../assets/images/home/spotlight-food.png'
import spotlightCoffeeImg from '../../../assets/images/home/spotlight-coffee.png'
import spotlightLogisticsImg from '../../../assets/images/home/spotlight-logistics.png'
import spotlightMerchImg from '../../../assets/images/home/spotlight-merch.png'

interface SpotlightItem {
  id: string
  title: string
  image: string
  label: string
}

// 5 spotlight pages (each containing 3 business cards matching the original grid)
const SPOTLIGHT_PAGES: SpotlightItem[][] = [
  // Page 1: Original Featured Showcase
  [
    {
      id: 'otso-1',
      title: 'OTSO BOTTLE Premium Packaging',
      image: spotlightOtsoImg,
      label: 'Sponsored',
    },
    {
      id: 'xyz-1',
      title: 'XYZ Enterprise One-Stop Packaging Supply',
      image: spotlightXyzImg,
      label: 'Suppliers/Distributors near you',
    },
    {
      id: 'food-1',
      title: "Frkn' Bgrs & Comfort Food",
      image: spotlightFoodImg,
      label: 'Food/Restaurants near you',
    },
  ],
  // Page 2: Services & Food Showcase
  [
    {
      id: 'coffee-2',
      title: 'Kape Isla Artisanal Coffee Roastery',
      image: spotlightCoffeeImg,
      label: 'Specialty Coffee & Beverages',
    },
    {
      id: 'logistics-2',
      title: 'SwiftGo Express Logistics & Warehousing',
      image: spotlightLogisticsImg,
      label: 'Logistics & Courier near you',
    },
    {
      id: 'merch-2',
      title: 'PrintCraft Custom Merchandise & Giveaways',
      image: spotlightMerchImg,
      label: 'Custom Printing & Giveaways',
    },
  ],
  // Page 3: Packaging & Supplies Showcase
  [
    {
      id: 'otso-3',
      title: 'OTSO Eco-Friendly Bottles & Jars',
      image: spotlightOtsoImg,
      label: 'Eco Packaging & Containers',
    },
    {
      id: 'xyz-3',
      title: 'XYZ Enterprise Corrugated Boxes',
      image: spotlightXyzImg,
      label: 'Wholesale Box Supply',
    },
    {
      id: 'coffee-3',
      title: 'Kape Isla Single Origin Cold Brew',
      image: spotlightCoffeeImg,
      label: 'Artisanal Cafe & Roasts',
    },
  ],
  // Page 4: Logistics & Catering Showcase
  [
    {
      id: 'food-4',
      title: "Frkn' Bgrs Party Trays & Catering",
      image: spotlightFoodImg,
      label: 'Catering & Event Meals',
    },
    {
      id: 'logistics-4',
      title: 'SwiftGo Same-Day Metro Courier',
      image: spotlightLogisticsImg,
      label: 'Express Metro Delivery',
    },
    {
      id: 'merch-4',
      title: 'PrintCraft Corporate Uniforms',
      image: spotlightMerchImg,
      label: 'Branded Corporate Apparel',
    },
  ],
  // Page 5: Community Highlights
  [
    {
      id: 'xyz-5',
      title: 'XYZ Enterprise Packaging Solutions',
      image: spotlightXyzImg,
      label: 'Verified Supplier',
    },
    {
      id: 'otso-5',
      title: 'OTSO BOTTLE Beverage Containers',
      image: spotlightOtsoImg,
      label: 'Premium Packaging Supply',
    },
    {
      id: 'food-5',
      title: "Frkn' Bgrs Gourmet Combos",
      image: spotlightFoodImg,
      label: 'Top-Rated Restaurants',
    },
  ],
]

export function BusinessSpotlightCard() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const totalPages = SPOTLIGHT_PAGES.length

  // Auto-slide every 5 seconds (pauses on user hover)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, totalPages])

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="flex flex-col justify-between rounded-xl border border-[#5ec5f5] bg-[#a6e5fc] p-4 shadow-xs transition hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-4 text-[#00a2e8]" />
            <h2 className="text-[14px] font-bold text-[#084869]">Business Spotlight</h2>
          </div>
          <p className="mt-0.5 text-xs text-[#0d557a]">
            Discover and support businesses owned by SimpleBIZ users.
          </p>
        </div>

        {/* Dots & Explore CTA */}
        <div className="flex items-center gap-3.5 self-end sm:self-center">
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Spotlight carousel pages"
          >
            {SPOTLIGHT_PAGES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                aria-label={`Go to page ${idx + 1}`}
                aria-selected={currentPage === idx}
                role="tab"
                className={`size-2 rounded-full transition-all duration-300 ${
                  currentPage === idx
                    ? 'w-3 bg-[#00a2e8]'
                    : 'bg-[#67cefa] hover:bg-[#38bdf8]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            className="rounded-full bg-[#00a2e8] px-4 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0288d1] active:scale-95"
          >
            Explore
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="mt-3 flex items-center gap-2 sm:gap-2.5">
        {/* Prev Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous businesses"
          className="flex size-6.5 shrink-0 items-center justify-center rounded-md border border-[#7ad5fa] bg-white/90 text-[#00a2e8] shadow-xs transition hover:bg-white hover:shadow-sm active:scale-95"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* Sliding Viewport */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {SPOTLIGHT_PAGES.map((page, pageIdx) => (
              <div
                key={pageIdx}
                className="grid w-full shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-3"
              >
                {page.map((item) => (
                  <div key={item.id} className="flex flex-col">
                    <div className="group overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-32 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-34 md:h-36"
                      />
                    </div>
                    <p className="mt-1 truncate text-center text-[11px] font-medium text-[#0b4e72] sm:text-[11.5px]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next businesses"
          className="flex size-6.5 shrink-0 items-center justify-center rounded-md border border-[#7ad5fa] bg-white/90 text-[#00a2e8] shadow-xs transition hover:bg-white hover:shadow-sm active:scale-95"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
