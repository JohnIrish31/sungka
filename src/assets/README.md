# SUNGKA — Asset Pack

Everything for the look, sound and logic, generated in code: no image files, no audio files, no CDN.
31 SVGs (about 59 KB raw), a synthesized sound module, 2 CSS files, small helpers, and a **tested reference engine**.

**Open `preview.html` in any browser**: it is a working mini version built from these exact files.
Then paste `MASTER_PROMPT.md` into Claude Code to build the Vite app.

## Folder layout (keep it as is; put the whole folder at `src/assets/`)

```
assets.ts              typed helpers for Vite (import.meta.glob of svg/)
fx.js                  launchConfetti(), replay(el, cls)
audio/sounds.js        play(name), setMuted(), unlockAudio(), startAmbient()/stopAmbient()
styles/theme.css       tokens + components for this app
styles/animations.css  .anim-* classes + confetti
reference/             reference/rules.js (sow returns a `trace` to animate), reference/bots.js (minimax: madali / katamtaman / magaling)
svg/
  board/       board-landscape (1000x400), board-portrait (400x1000) + pits-*.json
  shells/      sigay-puti, sigay-kayumanggi, sigay-rosas, sigay-ginto
  overlays/    pit-glow, pit-last, capture-burst, count-badge
  players/     token-0 (kahel, bottom), token-1 (lila, top)
  icons/       kamay, extra-turn, pass, ulo, speed + common UI icons
  decor/ scenes/  banig, banderitas, logo, hero
  icons/       sound-on, sound-off, rules, trophy, robot, home, restart, players, check, close
  manifest.json
```

## Notes

- Traditional rules: 7 houses + 1 ulo each, 7 shells per house, relay sowing, extra turn in your ulo, capture from the opposite house, pass when empty.
- Balance finding: in a single round the first mover always wins between strong bots (300/300). A 2-round match with swapped first player is fair (151/130/19), so it is the default.

## Sounds

`hulog, dampot, ulo, ulit, huli, laktaw + click, tick, card, pop, invalid, win, lose`. Browsers block audio until a user gesture: call `unlockAudio()` in the first tap.

## Animations

`anim-shell-drop, anim-pit-flash, anim-capture-pop`; common: anim-pop, anim-bump, anim-fade-in, anim-slide-up, anim-shake-x, anim-float, anim-sway, anim-wobble, anim-card-flip, anim-rise-fade. Motion is disabled under `prefers-reduced-motion`.
