import type { Game, Match, Player, Score, TraceEvent } from './types'

export type Rng = () => number

export const HOUSES = 7
export const START_SHELLS = 7
export const PIT_COUNT = 16
export const ULO: readonly [number, number] = [7, 15]
export const TOTAL_SHELLS = HOUSES * START_SHELLS * 2
export const MAX_STEPS = 5000

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const housesOf = (player: Player): number[] =>
  player === 0 ? [0, 1, 2, 3, 4, 5, 6] : [8, 9, 10, 11, 12, 13, 14]

export const ownerOf = (pit: number): Player => (pit <= 7 ? 0 : 1)
export const isUlo = (pit: number): boolean => pit === ULO[0] || pit === ULO[1]
export const oppositeOf = (pit: number): number => 14 - pit

const nextPit = (pit: number, player: Player): number => {
  const candidate = (pit + 1) % PIT_COUNT
  return candidate === ULO[1 - player] ? (candidate + 1) % PIT_COUNT : candidate
}

export function newGame(firstPlayer: Player = 0): Game {
  const pits = Array<number>(PIT_COUNT).fill(START_SHELLS)
  pits[ULO[0]] = 0
  pits[ULO[1]] = 0
  return { pits, turn: firstPlayer, done: false, passes: 0, last: null, moves: 0 }
}

export const legalMoves = (game: Game): number[] =>
  game.done ? [] : housesOf(game.turn).filter((pit) => game.pits[pit] > 0)

function settle(game: Game): Game {
  if (legalMoves(game).length > 0) return game
  const other = (1 - game.turn) as Player
  if (housesOf(other).some((pit) => game.pits[pit] > 0)) {
    return {
      ...game,
      turn: other,
      passes: game.passes + 1,
      last: game.last && { ...game.last, passed: game.turn },
    }
  }
  return { ...game, done: true }
}

export function sow(before: Game, start: number): Game {
  const player = before.turn
  if (before.done) throw new Error('The round is already over')
  if (!housesOf(player).includes(start) || before.pits[start] === 0) {
    throw new Error(`House ${start} cannot be played`)
  }

  const pits = before.pits.slice()
  const trace: TraceEvent[] = []
  let hand = pits[start]
  pits[start] = 0
  trace.push({ t: 'pick', pit: start, n: hand })

  let current = start
  let steps = 0
  let extra = false
  let captured = 0

  for (;;) {
    while (hand > 0) {
      current = nextPit(current, player)
      pits[current] += 1
      hand -= 1
      steps += 1
      trace.push({ t: 'drop', pit: current })
    }

    if (current === ULO[player]) {
      extra = true
      trace.push({ t: 'extra' })
      break
    }

    if (pits[current] > 1 && steps < MAX_STEPS) {
      hand = pits[current]
      pits[current] = 0
      trace.push({ t: 'pick', pit: current, n: hand })
      continue
    }

    if (ownerOf(current) === player && !isUlo(current)) {
      const facing = oppositeOf(current)
      if (pits[facing] > 0) {
        captured = pits[facing] + 1
        trace.push({ t: 'capture', pit: current, from: facing, n: captured })
        pits[ULO[player]] += captured
        pits[facing] = 0
        pits[current] = 0
      }
    }

    trace.push({ t: 'end' })
    break
  }

  const after: Game = {
    ...before,
    pits,
    moves: before.moves + 1,
    last: { player, start, trace, extra, captured },
  }
  if (!extra) after.turn = (1 - player) as Player
  return settle(after)
}

export const scoreOf = (game: Game): Score => [game.pits[ULO[0]], game.pits[ULO[1]]]

export function roundResult(game: Game): { scores: Score; winner: Player | null } {
  const [a, b] = scoreOf(game)
  return { scores: [a, b], winner: a === b ? null : a > b ? 0 : 1 }
}

export function newMatch(rounds = 2): Match {
  return { rounds, round: 1, totals: [0, 0], history: [], game: newGame(0), done: false }
}

export function finishRound(match: Match): Match {
  if (!match.game.done) throw new Error('The round is not over yet')
  const scores = scoreOf(match.game)
  const totals: Score = [match.totals[0] + scores[0], match.totals[1] + scores[1]]
  const history = match.history.concat([scores])
  if (match.round >= match.rounds) return { ...match, totals, history, done: true }
  return {
    ...match,
    totals,
    history,
    round: match.round + 1,
    game: newGame((match.round % 2) as Player),
  }
}

export function matchResult(match: Match): { totals: Score; winner: Player | null } {
  const [a, b] = match.totals
  return { totals: match.totals, winner: a === b ? null : a > b ? 0 : 1 }
}
