// SUNGKA: reference bots. Minimax with alpha-beta; an extra turn keeps the same player on move.
import { legalMoves, sow, ULO, housesOf } from './rules.js';

function evaluate(g, me) {
  const mine = g.pits[ULO[me]], theirs = g.pits[ULO[1 - me]];
  if (g.done) return (mine - theirs) * 1000;
  const onMySide = housesOf(me).reduce((s, i) => s + g.pits[i], 0);
  const onTheirSide = housesOf(1 - me).reduce((s, i) => s + g.pits[i], 0);
  return mine - theirs + 0.15 * (onMySide - onTheirSide);
}

function search(g, depth, alpha, beta, me) {
  if (depth === 0 || g.done) return evaluate(g, me);
  const moves = legalMoves(g);
  if (g.turn === me) {
    let v = -Infinity;
    for (const m of moves) { v = Math.max(v, search(sow(g, m), depth - 1, alpha, beta, me)); alpha = Math.max(alpha, v); if (alpha >= beta) break; }
    return v;
  }
  let v = Infinity;
  for (const m of moves) { v = Math.min(v, search(sow(g, m), depth - 1, alpha, beta, me)); beta = Math.min(beta, v); if (alpha >= beta) break; }
  return v;
}

/** depth 1 = greedy. noise > 0 adds randomness (for the easy level). Returns the house index to play. */
export function bestMove(g, depth, rng, noise = 0) {
  const me = g.turn;
  let best = null;
  for (const m of legalMoves(g)) {
    const v = search(sow(g, m), depth - 1, -Infinity, Infinity, me) + (noise ? (rng() - 0.5) * noise : rng() * 1e-6);
    if (!best || v > best.v) best = { v, m };
  }
  return best.m;
}

export const LEVELS = {
  madali: (g, rng) => bestMove(g, 1, rng, 14),
  katamtaman: (g, rng) => bestMove(g, 3, rng),
  magaling: (g, rng) => bestMove(g, 6, rng),
};
export const randomMove = (g, rng) => { const m = legalMoves(g); return m[Math.floor(rng() * m.length)]; };
