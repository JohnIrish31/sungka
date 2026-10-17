import { describe, expect, it } from 'vitest'
import { BOT_LEVELS, bestMove, chooseMove } from './bots'
import { finishRound, legalMoves, matchResult, mulberry32, newMatch, sow } from './rules'
import type { BotLevel, Match, Player } from './types'

function playMatch(levels: [BotLevel, BotLevel], seed: number, noise = 0): Match {
  const rng = mulberry32(seed)
  let match = newMatch(2)
  while (!match.done) {
    while (!match.game.done) {
      const level = levels[match.game.turn]
      const move = noise ? bestMove(match.game, 3, rng, noise) : chooseMove(level, match.game, rng)
      match = { ...match, game: sow(match.game, move) }
    }
    match = finishRound(match)
  }
  return match
}

describe('bot moves', () => {
  it('are always legal at every level', () => {
    for (const level of BOT_LEVELS) {
      for (let seed = 1; seed <= 10; seed++) {
        const rng = mulberry32(seed)
        let match = newMatch(1)
        while (!match.game.done) {
          const move = chooseMove(level, match.game, rng)
          expect(legalMoves(match.game)).toContain(move)
          match = { ...match, game: sow(match.game, move) }
        }
      }
    }
  })

  it('refuse to pick when there is nothing to play', () => {
    const rng = mulberry32(1)
    const finished = { ...newMatch(1).game, done: true }
    expect(() => chooseMove('madali', finished, rng)).toThrow()
  })
})

describe('bot strength', () => {
  it('katamtaman beats madali over a set of matches', () => {
    let wins = 0
    for (let seed = 1; seed <= 20; seed++) {
      const asBottom = matchResult(playMatch(['katamtaman', 'madali'], seed)).winner
      const asTop = matchResult(playMatch(['madali', 'katamtaman'], seed + 500)).winner
      if (asBottom === 0) wins++
      if (asTop === 1) wins++
    }
    expect(wins).toBeGreaterThanOrEqual(34)
  })
})

describe('balance', () => {
  it('katamtaman against katamtaman stays fair over 100 matches', () => {
    const tally: Record<'bottom' | 'top' | 'draw', number> = { bottom: 0, top: 0, draw: 0 }
    for (let seed = 1; seed <= 100; seed++) {
      const winner: Player | null = matchResult(playMatch(['katamtaman', 'katamtaman'], seed, 3)).winner
      if (winner === null) tally.draw++
      else if (winner === 0) tally.bottom++
      else tally.top++
    }
    expect(tally.bottom).toBeLessThanOrEqual(65)
    expect(tally.top).toBeLessThanOrEqual(65)
  }, 120_000)
})
