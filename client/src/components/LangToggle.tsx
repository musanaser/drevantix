import { Languages } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export function LangToggle({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  const { lang, toggle } = useI18n()
  return (
    <button
      onClick={toggle}
      title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
        dark ? 'text-slate-200 ring-1 ring-white/20 hover:bg-white/10 hover:text-white' : 'text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
      } ${className}`}
    >
      <Languages className="h-4 w-4" />
      {lang === 'ar' ? 'English' : 'العربية'}
    </button>
  )
}
