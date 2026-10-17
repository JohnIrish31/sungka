import { useEffect, useReducer, useState } from 'react'
import { isMuted, setMuted, unlockAudio } from './assets/audio/sounds'
import { AppBar } from './components/AppBar'
import { createInitialState, reducer } from './game/reducer'
import { LangContext, MESSAGES } from './i18n'
import { Game } from './screens/Game'
import { Home } from './screens/Home'
import { Result } from './screens/Result'
import { Rules } from './screens/Rules'
import { Setup } from './screens/Setup'
import { loadPreferences, savePreferences } from './storage/preferences'

function initialState() {
  const saved = loadPreferences()
  setMuted(saved.muted)
  const state = createInitialState({ lang: saved.lang })
  return { ...state, settings: { ...state.settings, speed: saved.speed } }
}

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [muted, setMutedState] = useState(isMuted)
  const t = MESSAGES[state.lang]
  const { screen, match } = state

  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = state.lang
    document.title = `${t.appName} · ${t.tagline}`
  }, [state.lang, t])

  useEffect(() => {
    savePreferences({ lang: state.lang, speed: state.settings.speed, muted })
  }, [state.lang, state.settings.speed, muted])

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  const goHome = () => {
    if (screen === 'game' && !window.confirm(t.game.leaveConfirm)) return
    dispatch({ type: 'navigate', to: 'home' })
  }

  return (
    <LangContext.Provider value={t}>
      <div className="app">
        <div className="banderitas-top" aria-hidden="true" />
        <AppBar
          lang={state.lang}
          muted={muted}
          onLang={(lang) => dispatch({ type: 'setLang', lang })}
          onToggleMute={toggleMute}
          onHome={screen === 'home' ? undefined : goHome}
        />

        {screen === 'home' && <Home state={state} dispatch={dispatch} />}
        {screen === 'rules' && <Rules dispatch={dispatch} />}
        {screen === 'setup' && <Setup state={state} dispatch={dispatch} />}
        {screen === 'game' && match && <Game state={state} match={match} dispatch={dispatch} />}
        {screen === 'result' && match && <Result state={state} match={match} dispatch={dispatch} />}
      </div>
    </LangContext.Provider>
  )
}
