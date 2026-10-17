import type { Dispatch } from 'react'
import { SCENE } from '../assets/assets'
import { LangSwitch } from '../components/LangSwitch'
import type { Action } from '../game/reducer'
import type { AppState } from '../game/types'
import { useMessages } from '../i18n'

interface HomeProps {
  state: AppState
  dispatch: Dispatch<Action>
}

export function Home({ state, dispatch }: HomeProps) {
  const t = useMessages()

  return (
    <main className="screen narrow center home">
      <img className="logo anim-pop" src={SCENE.logo} alt={t.appName} />
      <img className="hero anim-float" src={SCENE.hero} alt="" />
      <p className="lead">{t.tagline}</p>

      <section className="panel language-card" aria-labelledby="language-heading">
        <h2 id="language-heading">{t.language.heading}</h2>
        <LangSwitch lang={state.lang} onChange={(lang) => dispatch({ type: 'setLang', lang })} />
        <p className="note">{t.language.note}</p>
      </section>

      <div className="stack">
        <button type="button" className="btn big accent" onClick={() => dispatch({ type: 'navigate', to: 'setup' })}>
          {t.nav.play}
        </button>
        <button type="button" className="btn big ghost" onClick={() => dispatch({ type: 'navigate', to: 'rules' })}>
          {t.nav.howToPlay}
        </button>
      </div>
    </main>
  )
}
