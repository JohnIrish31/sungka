import { describe, expect, it } from 'vitest'
import * as referenceRules from '../assets/reference/rules.js'
import * as referenceBots from '../assets/reference/bots.js'
import { chooseMove } from './bots'
import { finishRound, legalMoves, matchResult, mulberry32, newGame, newMatch, sow } from './rules'
import type { BotLevel, Game } from './types'

const LEVELS: BotLevel[] = ['madali', 'katamtaman', 'magaling']
const MOVE_LIMIT = 400

describe('parity with the reference engine', () => {
  it('plays 300 seeded games with identical moves, pits and traces', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const levelFor = (turn: number) => LEVELS[(seed + turn) % LEVELS.length]
      let ours: Game = newGame((seed % 2) as 0 | 1)
      let theirs = referenceRules.newGame(seed % 2)
      expect(ours).toEqual(theirs)

      let moveNumber = 0
      while (!ours.done && moveNumber < MOVE_LIMIT) {
        const level = levelFor(ours.turn)
        const ourMove = chooseMove(level, ours, mulberry32(seed * 1000 + moveNumber))
        const theirMove = referenceBots.LEVELS[level](theirs, mulberry32(seed * 1000 + moveNumber))
        expect(ourMove).toBe(theirMove)
        expect(legalMoves(ours)).toContain(ourMove)

        ours = sow(ours, ourMove)
        theirs = referenceRules.sow(theirs, theirMove)
        expect(ours.pits).toEqual(theirs.pits)
        expect(ours.last).toEqual(theirs.last)
        expect(ours.turn).toBe(theirs.turn)
        expect(ours.done).toBe(theirs.done)
        moveNumber++
      }
      expect(ours.done).toBe(theirs.done)
    }
  }, 120_000)

  it('matches the reference for whole two-round matches', () => {
    for (let seed = 1; seed <= 20; seed++) {
      let ours = newMatch(2)
      let theirs = referenceRules.newMatch(2)
      for (let round = 0; round < 2; round++) {
        const rng = mulberry32(seed * 31 + round)
        const reference = mulberry32(seed * 31 + round)
        while (!ours.game.done) {
          const move = chooseMove('madali', ours.game, rng)
          expect(move).toBe(referenceBots.LEVELS.madali(theirs.game, reference))
          ours = { ...ours, game: sow(ours.game, move) }
          theirs = { ...theirs, game: referenceRules.sow(theirs.game, move) }
        }
        ours = finishRound(ours)
        theirs = referenceRules.finishRound(theirs)
        expect(ours.totals).toEqual(theirs.totals)
        expect(ours.round).toBe(theirs.round)
        expect(ours.game.turn).toBe(theirs.game.turn)
      }
      expect(ours.done).toBe(true)
      expect(matchResult(ours)).toEqual(referenceRules.matchResult(theirs))
    }
  })
})
