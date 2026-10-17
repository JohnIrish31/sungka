import { finishRound, legalMoves, newMatch, sow } from './rules'
import type { AppState, Lang, Player, Screen, Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  mode: 'bot',
  level: 'katamtaman',
  format: 'laban',
  speed: 'normal',
  names: ['', ''],
}

export const createInitialState = (overrides: Partial<AppState> = {}): AppState => ({
  screen: 'home',
  lang: 'en',
  settings: DEFAULT_SETTINGS,
  match: null,
  ...overrides,
})

export type Action =
  | { type: 'navigate'; to: Exclude<Screen, 'game' | 'result'> }
  | { type: 'setLang'; lang: Lang }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'startMatch' }
  | { type: 'play'; pit: number }
  | { type: 'nextRound' }

export const botSeat = (state: AppState): Player | null =>
  state.settings.mode === 'bot' ? 1 : null

export const isBotTurn = (state: AppState): boolean => {
  const { match } = state
  if (state.screen !== 'game' || !match || match.game.done) return false
  return match.game.turn === botSeat(state)
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'navigate':
      return { ...state, screen: action.to, match: null }

    case 'setLang':
      return { ...state, lang: action.lang }

    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'startMatch':
      return {
        ...state,
        screen: 'game',
        match: newMatch(state.settings.format === 'laban' ? 2 : 1),
      }

    case 'play': {
      const { match } = state
      if (state.screen !== 'game' || !match) return state
      if (!legalMoves(match.game).includes(action.pit)) return state
      return { ...state, match: { ...match, game: sow(match.game, action.pit) } }
    }

    case 'nextRound': {
      const { match } = state
      if (state.screen !== 'game' || !match || !match.game.done) return state
      const advanced = finishRound(match)
      return advanced.done
        ? { ...state, screen: 'result', match: advanced }
        : { ...state, match: advanced }
    }

    default:
      return state
  }
}
