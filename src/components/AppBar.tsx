import { ICON } from '../assets/assets'
import type { Lang } from '../game/types'
import { useMessages } from '../i18n'
import { LangSwitch } from './LangSwitch'

interface AppBarProps {
  lang: Lang
  muted: boolean
  onLang: (lang: Lang) => void
  onToggleMute: () => void
  onHome?: () => void
}

export function AppBar({ lang, muted, onLang, onToggleMute, onHome }: AppBarProps) {
  const t = useMessages()

  return (
    <header className="app-bar">
      {onHome ? (
        <button type="button" className="btn icon-btn" onClick={onHome} aria-label={t.nav.home}>
          <img src={ICON.home} alt="" />
        </button>
      ) : (
        <span className="app-bar-spacer" />
      )}

      <div className="app-bar-end">
        <LangSwitch lang={lang} onChange={onLang} compact />
        <button
          type="button"
          className="btn icon-btn"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? t.nav.unmuteLabel : t.nav.muteLabel}
        >
          <img src={muted ? ICON.soundOff : ICON.soundOn} alt="" />
        </button>
      </div>
    </header>
  )
}
