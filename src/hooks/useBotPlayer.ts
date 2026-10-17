import { useEffect } from 'react'
import type { Dispatch } from 'react'
import { chooseMove } from '../game/bots'
import { isBotTurn } from '../game/reducer'
import type { Action } from '../game/reducer'
import type { AppState } from '../game/types'

const MIN_THINK_MS = 400
const MAX_THINK_MS = 700

export function useBotPlayer(state: AppState, dispatch: Dispatch<Action>, busy: boolean): boolean {
  const game = state.match?.game
  const level = state.settings.level
  const waiting = isBotTurn(state) && !busy

  useEffect(() => {
    if (!waiting || !game) return

    const thinkFor = MIN_THINK_MS + Math.random() * (MAX_THINK_MS - MIN_THINK_MS)
    const timer = window.setTimeout(() => {
      dispatch({ type: 'play', pit: chooseMove(level, game, Math.random) })
    }, thinkFor)

    return () => window.clearTimeout(timer)
  }, [waiting, game, level, dispatch])

  return waiting
}
