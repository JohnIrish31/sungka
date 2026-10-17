export type Player = 0 | 1
export type Lang = 'en' | 'tl'
export type BotLevel = 'madali' | 'katamtaman' | 'magaling'
export type Mode = 'bot' | 'versus'
export type Format = 'laban' | 'mabilis'
export type Speed = 'slow' | 'normal' | 'fast'
export type Screen = 'home' | 'rules' | 'setup' | 'game' | 'result'

export type TraceEvent =
  | { t: 'pick'; pit: number; n: number }
  | { t: 'drop'; pit: number }
  | { t: 'capture'; pit: number; from: number; n: number }
  | { t: 'extra' }
  | { t: 'end' }

export interface LastMove {
  player: Player
  start: number
  trace: TraceEvent[]
  extra: boolean
  captured: number
  passed?: Player
}

export interface Game {
  pits: number[]
  turn: Player
  done: boolean
  passes: number
  last: LastMove | null
  moves: number
}

export type Score = [number, number]

export interface Match {
  rounds: number
  round: number
  totals: Score
  history: Score[]
  game: Game
  done: boolean
}

export interface Settings {
  mode: Mode
  level: BotLevel
  format: Format
  speed: Speed
  names: [string, string]
}

export interface AppState {
  screen: Screen
  lang: Lang
  settings: Settings
  match: Match | null
}
