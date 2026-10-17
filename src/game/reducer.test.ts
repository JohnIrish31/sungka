import { describe, expect, it } from 'vitest'
import { createInitialState, isBotTurn, reducer } from './reducer'
import type { Action } from './reducer'
import { legalMoves, mulberry32 } from './rules'
import { randomMove } from './bots'
import type { AppState } from './types'

const run = (state: AppState, ...actions: Action[]) => actions.reduce(reducer, state)

const started = (patch: Partial<AppState['settings']> = {}) =>
  run(createInitialState(), { type: 'updateSettings', patch }, { type: 'startMatch' })

describe('navigation and settings', () => {
  it('starts on the home screen in English', () => {
    const state = createInitialState()
    expect(state.screen).toBe('home')
    expect(state.lang).toBe('en')
  })

  it('switches language without touching the game', () => {
    const state = run(started(), { type: 'setLang', lang: 'tl' })
    expect(state.lang).toBe('tl')
    expect(state.screen).toBe('game')
    expect(state.match).not.toBeNull()
  })

  it('merges settings patches', () => {
    const state = run(createInitialState(), { type: 'updateSettings', patch: { level: 'magaling' } })
    expect(state.settings.level).toBe('magaling')
    expect(state.settings.format).toBe('laban')
  })

  it('drops the match when going back to a menu screen', () => {
    const state = run(started(), { type: 'navigate', to: 'home' })
    expect(state.screen).toBe('home')
    expect(state.match).toBeNull()
  })
})

describe('starting a match', () => {
  it('plays two rounds for Laban and one for Mabilis', () => {
    expect(started({ format: 'laban' }).match!.rounds).toBe(2)
    expect(started({ format: 'mabilis' }).match!.rounds).toBe(1)
  })

  it('opens the game screen with a full board', () => {
    const state = started()
    expect(state.screen).toBe('game')
    expect(state.match!.game.pits.reduce((a, b) => a + b, 0)).toBe(98)
  })
})

describe('playing moves', () => {
  it('applies a legal move', () => {
    const state = run(started(), { type: 'play', pit: 2 })
    expect(state.match!.game.moves).toBe(1)
    expect(state.match!.game.pits[2]).toBe(0)
  })

  it('ignores illegal moves instead of throwing', () => {
    const before = started()
    expect(run(before, { type: 'play', pit: 9 })).toBe(before)
    expect(run(before, { type: 'play', pit: 99 })).toBe(before)
  })

  it('ignores moves outside the game screen', () => {
    const home = createInitialState()
    expect(reducer(home, { type: 'play', pit: 0 })).toBe(home)
  })

  it('recognises when it is the bot turn', () => {
    const afterHuman = run(started({ mode: 'bot' }), { type: 'play', pit: 0 })
    expect(isBotTurn(afterHuman)).toBe(afterHuman.match!.game.turn === 1)
    expect(isBotTurn(started({ mode: 'versus' }))).toBe(false)
  })
})

describe('finishing rounds', () => {
  const playRound = (state: AppState, seed: number): AppState => {
    const rng = mulberry32(seed)
    let current = state
    while (!current.match!.game.done) {
      const pit = randomMove(current.match!.game, rng)
      expect(legalMoves(current.match!.game)).toContain(pit)
      current = reducer(current, { type: 'play', pit })
    }
    return current
  }

  it('ignores nextRound while the round is still running', () => {
    const state = started()
    expect(reducer(state, { type: 'nextRound' })).toBe(state)
  })

  it('moves on to round two with the other player first', () => {
    const state = reducer(playRound(started(), 7), { type: 'nextRound' })
    expect(state.screen).toBe('game')
    expect(state.match!.round).toBe(2)
    expect(state.match!.game.turn).toBe(1)
  })

  it('shows the result after the last round with totals added up', () => {
    let state = reducer(playRound(started(), 11), { type: 'nextRound' })
    state = reducer(playRound(state, 12), { type: 'nextRound' })
    expect(state.screen).toBe('result')
    expect(state.match!.done).toBe(true)
    expect(state.match!.history).toHaveLength(2)
    expect(state.match!.totals[0] + state.match!.totals[1]).toBe(196)
  })

  it('goes straight to the result for a one-round match', () => {
    const state = reducer(playRound(started({ format: 'mabilis' }), 3), { type: 'nextRound' })
    expect(state.screen).toBe('result')
    expect(state.match!.totals[0] + state.match!.totals[1]).toBe(98)
  })

  it('can rematch from the result screen', () => {
    const finished = reducer(playRound(started({ format: 'mabilis' }), 5), { type: 'nextRound' })
    const again = reducer(finished, { type: 'startMatch' })
    expect(again.screen).toBe('game')
    expect(again.match!.round).toBe(1)
    expect(again.match!.totals).toEqual([0, 0])
  })
})
