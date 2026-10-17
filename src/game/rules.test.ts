import { describe, expect, it } from 'vitest'
import {
  MAX_STEPS,
  TOTAL_SHELLS,
  finishRound,
  legalMoves,
  matchResult,
  mulberry32,
  newGame,
  newMatch,
  scoreOf,
  sow,
} from './rules'
import { randomMove } from './bots'
import type { Game, Player, Score } from './types'

const position = (entries: Record<number, number>, turn: Player = 0): Game => {
  const pits = Array<number>(16).fill(0)
  for (const [pit, count] of Object.entries(entries)) pits[Number(pit)] = count
  return { pits, turn, done: false, passes: 0, last: null, moves: 0 }
}

const shellsOn = (game: Game) => game.pits.reduce((sum, n) => sum + n, 0)

describe('starting position', () => {
  it('has 98 shells, seven per house, and empty ulos', () => {
    const game = newGame()
    expect(shellsOn(game)).toBe(98)
    expect(shellsOn(game)).toBe(TOTAL_SHELLS)
    expect(game.pits.filter((n) => n === 7)).toHaveLength(14)
    expect(game.pits[7]).toBe(0)
    expect(game.pits[15]).toBe(0)
  })

  it('lets each first player choose among their own seven houses', () => {
    expect(legalMoves(newGame(0))).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(legalMoves(newGame(1))).toEqual([8, 9, 10, 11, 12, 13, 14])
  })
})

describe('sowing', () => {
  it("skips the opponent's ulo when the bottom player sows", () => {
    const after = sow(position({ 6: 12, 14: 1 }), 6)
    const drops = after.last!.trace.filter((e) => e.t === 'drop')
    expect(drops).toHaveLength(12)
    expect(drops.some((e) => e.t === 'drop' && e.pit === 15)).toBe(false)
    expect(after.pits[15]).toBe(0)
  })

  it("skips the bottom player's ulo when the top player sows", () => {
    const after = sow(position({ 14: 10, 0: 1 }, 1), 14)
    const drops = after.last!.trace.filter((e) => e.t === 'drop')
    expect(drops.map((e) => (e.t === 'drop' ? e.pit : -1))).toEqual([15, 0, 1, 2, 3, 4, 5, 6, 8, 9])
    expect(after.pits[7]).toBe(0)
  })

  it('rejects empty houses and houses of the other player', () => {
    const game = position({ 1: 3, 9: 3 })
    expect(() => sow(game, 0)).toThrow()
    expect(() => sow(game, 9)).toThrow()
  })

  it('grants an extra turn when the last shell lands in your own ulo', () => {
    const after = sow(position({ 4: 3, 13: 5 }), 4)
    expect(after.pits[7]).toBe(1)
    expect(after.turn).toBe(0)
    expect(after.last!.extra).toBe(true)
    expect(after.last!.trace[after.last!.trace.length - 1]).toEqual({ t: 'extra' })
  })

  it('keeps sowing when the last shell lands in a non-empty pit', () => {
    const after = sow(position({ 0: 2, 2: 3, 14: 4 }), 0)
    const picks = after.last!.trace.filter((e) => e.t === 'pick')
    expect(picks).toEqual([
      { t: 'pick', pit: 0, n: 2 },
      { t: 'pick', pit: 2, n: 4 },
    ])
    expect(after.pits.slice(0, 7)).toEqual([0, 1, 0, 1, 1, 1, 1])
    expect(after.turn).toBe(1)
  })

  it('captures the opposite house plus the landing shell', () => {
    const after = sow(position({ 0: 3, 11: 6, 13: 2 }), 0)
    expect(after.last!.captured).toBe(7)
    expect(after.last!.trace.find((e) => e.t === 'capture')).toEqual({
      t: 'capture',
      pit: 3,
      from: 11,
      n: 7,
    })
    expect(after.pits[7]).toBe(7)
    expect(after.pits[3]).toBe(0)
    expect(after.pits[11]).toBe(0)
    expect(after.turn).toBe(1)
  })

  it('captures nothing when the opposite house is empty', () => {
    const after = sow(position({ 0: 3, 13: 2 }), 0)
    expect(after.last!.captured).toBe(0)
    expect(after.last!.trace.some((e) => e.t === 'capture')).toBe(false)
    expect(after.pits[3]).toBe(1)
    expect(after.pits[7]).toBe(0)
  })

  it('ends the turn on an empty house on the opponent side', () => {
    const after = sow(position({ 6: 2, 5: 4 }), 6)
    expect(after.last!.extra).toBe(false)
    expect(after.last!.captured).toBe(0)
    expect(after.pits[7]).toBe(1)
    expect(after.pits[8]).toBe(1)
    expect(after.turn).toBe(1)
  })

  it('lets the top player capture across the board too', () => {
    const after = sow(position({ 8: 2, 4: 5, 1: 3 }, 1), 8)
    expect(after.last!.captured).toBe(6)
    expect(after.pits[15]).toBe(6)
    expect(after.pits[4]).toBe(0)
  })
})

describe('passing and round end', () => {
  it('passes the turn when the opponent has nothing left to play', () => {
    const after = sow(position({ 0: 2, 12: 3, 5: 4 }), 0)
    expect(after.pits[7]).toBe(4)
    expect(after.turn).toBe(0)
    expect(after.last!.passed).toBe(1)
    expect(after.passes).toBe(1)
    expect(after.done).toBe(false)
  })

  it('ends the round when nobody can move', () => {
    const after = sow(position({ 6: 1 }), 6)
    expect(after.pits[7]).toBe(1)
    expect(after.done).toBe(true)
    expect(legalMoves(after)).toEqual([])
    expect(() => sow(after, 0)).toThrow()
  })
})

describe('conservation and safety', () => {
  it('keeps all 98 shells after every move of 500 random games', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const rng = mulberry32(seed)
      let game = newGame((seed % 2) as Player)
      let turns = 0
      while (!game.done && turns++ < 3000) {
        game = sow(game, randomMove(game, rng))
        expect(shellsOn(game)).toBe(98)
      }
      expect(game.done).toBe(true)
    }
  })

  it('stops relaying once MAX_STEPS drops have happened', () => {
    const rng = mulberry32(99)
    for (let trial = 0; trial < 200; trial++) {
      const pits = Array.from({ length: 16 }, () => Math.floor(rng() * 40))
      const game: Game = { pits, turn: 0, done: false, passes: 0, last: null, moves: 0 }
      const moves = legalMoves(game)
      if (moves.length === 0) continue
      const after = sow(game, moves[0])
      const drops = after.last!.trace.filter((e) => e.t === 'drop').length
      expect(drops).toBeLessThanOrEqual(MAX_STEPS + shellsOn(game))
      expect(shellsOn(after)).toBe(shellsOn(game))
    }
  })
})

describe('matches', () => {
  it('swaps the first player for the second round', () => {
    const match = newMatch(2)
    expect(match.game.turn).toBe(0)
    const next = finishRound({ ...match, game: { ...match.game, done: true } })
    expect(next.round).toBe(2)
    expect(next.game.turn).toBe(1)
  })

  it('adds up the shells of both rounds', () => {
    const scores: Score[] = [
      [60, 38],
      [40, 58],
    ]
    let match = newMatch(2)
    for (const [mine, theirs] of scores) {
      const pits = position({ 7: mine, 15: theirs }).pits
      match = finishRound({ ...match, game: { ...match.game, pits, done: true } })
    }
    expect(match.done).toBe(true)
    expect(match.totals).toEqual([100, 96])
    expect(match.history).toEqual(scores)
    expect(matchResult(match).winner).toBe(0)
  })

  it('refuses to finish a round that is still being played', () => {
    expect(() => finishRound(newMatch())).toThrow()
  })

  it('reports a draw when the totals are level', () => {
    expect(matchResult({ ...newMatch(1), totals: [49, 49] }).winner).toBeNull()
  })

  it('reads both ulos for the score', () => {
    expect(scoreOf(position({ 7: 3, 15: 9 }))).toEqual([3, 9])
  })
})
