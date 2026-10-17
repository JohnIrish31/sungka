import { housesOf, legalMoves, sow, ULO } from './rules'
import type { Rng } from './rules'
import type { BotLevel, Game, Player } from './types'

function evaluate(game: Game, me: Player): number {
  const mine = game.pits[ULO[me]]
  const theirs = game.pits[ULO[1 - me]]
  if (game.done) return (mine - theirs) * 1000
  const onMySide = housesOf(me).reduce((sum, pit) => sum + game.pits[pit], 0)
  const onTheirSide = housesOf((1 - me) as Player).reduce((sum, pit) => sum + game.pits[pit], 0)
  return mine - theirs + 0.15 * (onMySide - onTheirSide)
}

function search(game: Game, depth: number, alpha: number, beta: number, me: Player): number {
  if (depth === 0 || game.done) return evaluate(game, me)
  const moves = legalMoves(game)

  if (game.turn === me) {
    let value = -Infinity
    for (const move of moves) {
      value = Math.max(value, search(sow(game, move), depth - 1, alpha, beta, me))
      alpha = Math.max(alpha, value)
      if (alpha >= beta) break
    }
    return value
  }

  let value = Infinity
  for (const move of moves) {
    value = Math.min(value, search(sow(game, move), depth - 1, alpha, beta, me))
    beta = Math.min(beta, value)
    if (alpha >= beta) break
  }
  return value
}

export function bestMove(game: Game, depth: number, rng: Rng, noise = 0): number {
  const me = game.turn
  let best: { value: number; move: number } | null = null

  for (const move of legalMoves(game)) {
    const jitter = noise ? (rng() - 0.5) * noise : rng() * 1e-6
    const value = search(sow(game, move), depth - 1, -Infinity, Infinity, me) + jitter
    if (!best || value > best.value) best = { value, move }
  }

  if (!best) throw new Error('No legal moves to choose from')
  return best.move
}

const LEVELS: Record<BotLevel, (game: Game, rng: Rng) => number> = {
  madali: (game, rng) => bestMove(game, 1, rng, 14),
  katamtaman: (game, rng) => bestMove(game, 3, rng),
  magaling: (game, rng) => bestMove(game, 6, rng),
}

export const BOT_LEVELS: BotLevel[] = ['madali', 'katamtaman', 'magaling']

export const chooseMove = (level: BotLevel, game: Game, rng: Rng): number => LEVELS[level](game, rng)

export function randomMove(game: Game, rng: Rng): number {
  const moves = legalMoves(game)
  return moves[Math.floor(rng() * moves.length)]
}
