// Typed access to every SVG. Vite hashes + serves them as plain URLs, so use <img src={...}>.
// Keep this file next to the svg/ folder (e.g. src/assets/assets.ts).
const urls = import.meta.glob('./svg/**/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const svg = (path: string): string => {
  const u = urls[`./svg/${path}.svg`];
  if (!u) throw new Error(`Missing asset: ${path}`);
  return u;
};

export const ICON = {
  soundOn: svg('icons/sound-on'), soundOff: svg('icons/sound-off'), rules: svg('icons/rules'), trophy: svg('icons/trophy'),
  robot: svg('icons/robot'), home: svg('icons/home'), restart: svg('icons/restart'), players: svg('icons/players'),
  check: svg('icons/check'), close: svg('icons/close'),
} as const;

import pitsLandscape from './svg/board/pits-landscape.json';
import pitsPortrait from './svg/board/pits-portrait.json';
export type Pit = { index: number; owner: 0 | 1; ulo: boolean; x: number; y: number; r: number };
export const PITS = { landscape: pitsLandscape.pits as Pit[], portrait: pitsPortrait.pits as Pit[] };
export const BOARD = { landscape: svg('board/board-landscape'), portrait: svg('board/board-portrait') } as const;
export const SHELLS = ['puti', 'kayumanggi', 'rosas', 'ginto'].map((k) => svg(`shells/sigay-${k}`));
/** Deterministic look for shell #n inside a pit: which image, where (%), rotation. */
export function shellLook(pit: number, n: number) {
  let h = (pit * 73856093) ^ (n * 19349663); h = (h ^ (h >>> 13)) >>> 0;
  const a = (h % 360) * Math.PI / 180, rr = 8 + ((h >>> 9) % 34);
  return { src: SHELLS[(h >>> 4) % SHELLS.length], left: 50 + Math.cos(a) * rr, top: 50 + Math.sin(a) * rr, rot: (h >>> 7) % 360 };
}
export const OVERLAY = { glow: svg('overlays/pit-glow'), last: svg('overlays/pit-last'), capture: svg('overlays/capture-burst'), badge: svg('overlays/count-badge') } as const;
export const GAME_ICON = { kamay: svg('icons/kamay'), extra: svg('icons/extra-turn'), pass: svg('icons/pass'), ulo: svg('icons/ulo'), speed: svg('icons/speed') } as const;
export const token = (p: 0 | 1) => svg(`players/token-${p}`);
export const SCENE = { logo: svg('scenes/logo'), hero: svg('scenes/hero'), banig: svg('decor/banig') } as const;
