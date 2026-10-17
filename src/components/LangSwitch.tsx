import { useMessages } from '../i18n'
import type { Lang } from '../game/types'

interface LangSwitchProps {
  lang: Lang
  onChange: (lang: Lang) => void
  compact?: boolean
}

export function LangSwitch({ lang, onChange, compact = false }: LangSwitchProps) {
  const t = useMessages()
  const options: { value: Lang; text: string; short: string }[] = [
    { value: 'en', text: t.language.english, short: 'EN' },
    { value: 'tl', text: t.language.tagalog, short: 'TL' },
  ]

  return (
    <div className="row lang-switch" role="group" aria-label={t.language.label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="choice"
          aria-pressed={lang === option.value}
          aria-label={compact ? option.text : undefined}
          lang={option.value}
          onClick={() => onChange(option.value)}
        >
          {compact ? option.short : option.text}
        </button>
      ))}
    </div>
  )
}
