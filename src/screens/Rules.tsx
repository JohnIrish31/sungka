import type { Dispatch } from 'react'
import { ICON } from '../assets/assets'
import { Board } from '../components/Board'
import type { Action } from '../game/reducer'
import { useMessages } from '../i18n'
import { usePortrait } from '../hooks/usePortrait'

interface RulesProps {
  dispatch: Dispatch<Action>
}

interface Scene {
  pits: number[]
  ringed: number[]
}

const scene = (filled: Record<number, number>, ringed: number[]): Scene => {
  const pits = Array<number>(16).fill(0)
  for (const [pit, count] of Object.entries(filled)) pits[Number(pit)] = count
  return { pits, ringed }
}

const OPENING: Scene = { pits: [7, 7, 7, 7, 7, 7, 7, 0, 7, 7, 7, 7, 7, 7, 7, 0], ringed: [2] }

const SCENES: (Scene | null)[] = [
  OPENING,
  scene({ 0: 5, 1: 2, 2: 6, 3: 4, 4: 3, 5: 3, 6: 1, 7: 5, 8: 4, 9: 3, 10: 6, 11: 2, 12: 5, 13: 3, 14: 7, 15: 3 }, [4, 7]),
  scene({ 0: 2, 1: 4, 2: 3, 3: 5, 4: 1, 5: 6, 6: 2, 7: 4, 8: 3, 9: 5, 10: 4, 11: 6, 12: 2, 13: 3, 14: 5, 15: 2 }, [0, 2]),
  scene({ 0: 3, 1: 0, 2: 0, 3: 0, 4: 5, 5: 2, 6: 4, 7: 8, 8: 3, 9: 2, 10: 4, 11: 6, 12: 5, 13: 1, 14: 3, 15: 6 }, [0, 3, 11]),
  scene({ 7: 31, 8: 6, 9: 4, 10: 7, 11: 3, 12: 8, 13: 5, 14: 6, 15: 18 }, []),
  null,
]

export function Rules({ dispatch }: RulesProps) {
  const t = useMessages()
  const portrait = usePortrait()

  return (
    <main className="screen rules">
      <h1>{t.rules.title}</h1>
      <p className="lead">{t.rules.intro}</p>

      <ol className="steps">
        {t.rules.steps.map((step, index) => {
          const picture = SCENES[index]
          return (
            <li key={step.title} className="panel step">
              <h2>
                <span className="step-number">{index + 1}</span> {step.title}
              </h2>
              <p>{step.body}</p>
              {picture ? (
                <Board
                  pits={picture.pits}
                  portrait={portrait}
                  label={step.title}
                  ringed={new Set(picture.ringed)}
                  decorative
                />
              ) : (
                <img className="step-icon anim-wobble" src={ICON.trophy} alt="" />
              )}
            </li>
          )
        })}
      </ol>

      <button type="button" className="btn big accent" onClick={() => dispatch({ type: 'navigate', to: 'setup' })}>
        {t.nav.play}
      </button>
      <button type="button" className="btn big ghost" onClick={() => dispatch({ type: 'navigate', to: 'home' })}>
        {t.nav.back}
      </button>
    </main>
  )
}
