import type { BotLevel } from '../game/types'
import { readJson, writeJson } from './safeStorage'

const KEY = 'sungka.records.v1'

export type Outcome = 'win' | 'loss' | 'draw'

export interface Tally {
  wins: number
  losses: number
  draws: number
}

export type Records = Record<BotLevel, Tally>

const emptyTally = (): Tally => ({ wins: 0, losses: 0, draws: 0 })

const emptyRecords = (): Records => ({
  madali: emptyTally(),
  katamtaman: emptyTally(),
  magaling: emptyTally(),
})

const count = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0

export function loadRecords(): Records {
  const saved = readJson<Partial<Record<BotLevel, Partial<Tally>>>>(KEY, {})
  const records = emptyRecords()
  for (const level of Object.keys(records) as BotLevel[]) {
    records[level] = {
      wins: count(saved[level]?.wins),
      losses: count(saved[level]?.losses),
      draws: count(saved[level]?.draws),
    }
  }
  return records
}

export function recordOutcome(level: BotLevel, outcome: Outcome): Records {
  const records = loadRecords()
  const tally = records[level]
  if (outcome === 'win') tally.wins += 1
  else if (outcome === 'loss') tally.losses += 1
  else tally.draws += 1
  writeJson(KEY, records)
  return records
}
