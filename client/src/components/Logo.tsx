import { useId } from 'react'

export function LogoMark({ className = 'h-9 w-9', light = false }: { className?: string; light?: boolean }) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light ? '#ffffff' : '#1e40af'} />
          <stop offset="1" stopColor={light ? '#dbeafe' : '#0b2a6b'} />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}d)`} fillRule="evenodd" d="M8 8h46a42 42 0 0 1 0 84H8V64l20-10v18h26a22 22 0 0 0 0-44H28v14L8 52z" />
      <path fill={`url(#${id}c)`} d="M8 92V66l64-40-30 66z" />
    </svg>
  )
}

export function Logo({ light = false, tagline = false, size = 'md' }: { light?: boolean; tagline?: boolean; size?: 'md' | 'lg' }) {
  const big = size === 'lg'
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark light={light} className={big ? 'h-12 w-12' : 'h-9 w-9'} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-[0.12em] ${big ? 'text-3xl' : 'text-xl'} ${light ? 'text-white' : 'text-navy-800'}`}>
          DREVANTI<span className="bg-gradient-to-br from-cyan-300 to-sky-500 bg-clip-text text-transparent">X</span>
        </span>
        {tagline && (
          <span className={`mt-1 text-[8px] font-medium tracking-[0.22em] ${light ? 'text-slate-300' : 'text-navy-700'}`}>
            SMARTER TECHNOLOGY. SAFER TOMORROW.
          </span>
        )}
      </span>
    </span>
  )
}
