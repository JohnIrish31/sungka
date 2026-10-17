// SUNGKA: reference rules engine (pure JS, no DOM). Every function returns a NEW state.
// Board indices (16 pits):
//   0..6   = bahay of player 0 (the player at the BOTTOM), left -> right on screen
//   7      = ulo (head/store) of player 0 (right end)
//   8..14  = bahay of player 1 (the player at the TOP), right -> left on screen
//   15     = ulo of player 1 (left end)
// Shells always travel 0 -> 1 -> ... -> 15 -> 0 (counter-clockwise on screen), skipping the opponent's ulo.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const HOUSES = 7;
export const START_SHELLS = 7;
export const PITS = 16;
export const ULO = [7, 15];
export const TOTAL = HOUSES * START_SHELLS * 2; // 98
export const MAX_STEPS = 5000; // safety cap for very long relay chains (never reached in testing)

export const housesOf = (p) => (p === 0 ? [0, 1, 2, 3, 4, 5, 6] : [8, 9, 10, 11, 12, 13, 14]);
export const ownerOf = (i) => (i <= 7 ? 0 : 1);
export const isUlo = (i) => i === 7 || i === 15;
export const opposite = (i) => 14 - i;   // 0<->14, 6<->8
const next = (i, p) => { let j = (i + 1) % PITS; if (j === ULO[1 - p]) j = (j + 1) % PITS; return j; };

export function newGame(firstPlayer = 0) {
  const pits = Array(PITS).fill(START_SHELLS);
  pits[7] = 0; pits[15] = 0;
  return { pits, turn: firstPlayer, done: false, passes: 0, last: null, moves: 0 };
}

export const legalMoves = (g) => (g.done ? [] : housesOf(g.turn).filter((i) => g.pits[i] > 0));

/**
 * Play house `start` for the current player. Returns the new state; `state.last.trace` lists every
 * event in order so the UI can animate it shell by shell:
 *   { t:'pick', pit, n }      pick up n shells from pit
 *   { t:'drop', pit }         drop one shell into pit
 *   { t:'capture', pit, from, n }  move n shells (from `from` + the last shell in pit) into your ulo
 *   { t:'extra' }             last shell in your own ulo: play again
 *   { t:'end' }               turn over
 */
export function sow(g0, start) {
  const p = g0.turn;
  if (g0.done) throw new Error('Tapos na ang laro');
  if (!housesOf(p).includes(start) || g0.pits[start] === 0) throw new Error('Hindi pwedeng piliin ang bahay na iyan');
  const pits = g0.pits.slice();
  const trace = [];
  let hand = pits[start]; pits[start] = 0; trace.push({ t: 'pick', pit: start, n: hand });
  let i = start, steps = 0, extra = false, captured = 0;
  for (;;) {
    while (hand > 0) { i = next(i, p); pits[i] += 1; hand -= 1; trace.push({ t: 'drop', pit: i }); steps++; }
    if (i === ULO[p]) { extra = true; trace.push({ t: 'extra' }); break; }
    if (pits[i] > 1 && steps < MAX_STEPS) { hand = pits[i]; pits[i] = 0; trace.push({ t: 'pick', pit: i, n: hand }); continue; } // relay ("sunod")
    // landed in an empty pit
    if (ownerOf(i) === p && !isUlo(i)) {
      const o = opposite(i);
      if (pits[o] > 0) {
        captured = pits[o] + 1;
        trace.push({ t: 'capture', pit: i, from: o, n: captured });
        pits[ULO[p]] += captured; pits[o] = 0; pits[i] = 0;
      }
    }
    trace.push({ t: 'end' });
    break;
  }
  let g = { ...g0, pits, moves: g0.moves + 1, last: { player: p, start, trace, extra, captured } };
  if (!extra) g.turn = 1 - p;
  return settle(g);
}

/** If the player to move has no shells, they pass. If nobody can move, the game is over. */
function settle(g) {
  if (legalMoves(g).length > 0) return g;
  const other = 1 - g.turn;
  if (housesOf(other).some((i) => g.pits[i] > 0)) return { ...g, turn: other, passes: g.passes + 1, last: { ...(g.last || {}), passed: g.turn } };
  return { ...g, done: true };
}

export const score = (g) => [g.pits[7], g.pits[15]];

// ---- "Laban" (match) = 2 rounds. Round 1: player 0 starts; round 2: player 1 starts. Shells are added up.
// Measured: whoever moves first in a single round has a big edge between strong players, so a match
// of two rounds with swapped starters is the fair default. A single round ("Mabilis") is also offered.
export function newMatch(rounds = 2) { return { rounds, round: 1, totals: [0, 0], history: [], game: newGame(0) }; }
export function finishRound(m) {
  if (!m.game.done) throw new Error('Hindi pa tapos ang round');
  const s = score(m.game);
  const totals = [m.totals[0] + s[0], m.totals[1] + s[1]];
  const history = m.history.concat([s]);
  if (m.round >= m.rounds) return { ...m, totals, history, done: true };
  return { ...m, totals, history, round: m.round + 1, game: newGame(m.round % 2) };
}
export function matchResult(m) {
  const [a, b] = m.totals;
  return { totals: m.totals, winner: a === b ? null : a > b ? 0 : 1 };
}
export function result(g) {
  const [a, b] = score(g);
  return { scores: [a, b], winner: a === b ? null : a > b ? 0 : 1 };
}
