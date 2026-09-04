import type { SVGProps } from 'react'

export function ReportsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
      {...props}
    >
      {/* 3D-styled Blue Bars */}
      <rect x="2.5" y="12.5" width="4" height="8.5" rx="1" fill="#2563eb" />
      <rect x="2.5" y="12.5" width="1.8" height="8.5" rx="1" fill="#3b82f6" opacity="0.6" />
      
      <rect x="8.5" y="8.5" width="4" height="12.5" rx="1" fill="#1d4ed8" />
      <rect x="8.5" y="8.5" width="1.8" height="12.5" rx="1" fill="#60a5fa" opacity="0.6" />
      
      <rect x="14.5" y="4.5" width="4" height="16.5" rx="1" fill="#1e40af" />
      <rect x="14.5" y="4.5" width="1.8" height="16.5" rx="1" fill="#93c5fd" opacity="0.6" />

      {/* Upward Trend Line & Arrow */}
      <path
        d="M2 13L7.5 7.5L12.5 11.5L20.5 3"
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3H20.5V7.5"
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
