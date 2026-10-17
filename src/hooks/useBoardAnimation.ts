import { useCallback, useEffect, useRef, useState } from 'react'
import { play } from '../assets/audio/sounds'
import { isUlo, ULO } from '../game/rules'
import type { Game, Player, Speed } from '../game/types'

export type Note =
  | { kind: 'extra' }
  | { kind: 'capture'; amount: number }
  | { kind: 'pass'; player: Player }

export interface BoardView {
  pits: number[]
  hand: { pit: number; n: number } | null
  dropped: number | null
  burstAt: number | null
  note: Note | null
}

const STEP_MS: Record<Speed, number> = { slow: 110, normal: 70, fast: 35 }
const LONG_TRACE = 120
const PICK_FACTOR = 2.5
const FLY_MS = 260
const LAND_MS = 220
const EXTRA_MS = 450
const PASS_MS = 500

const restingView = (game: Game): BoardView => ({
  pits: game.pits.slice(),
  hand: null,
  dropped: null,
  burstAt: null,
  note: null,
})

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

export function useBoardAnimation(game: Game, speed: Speed) {
  const [view, setView] = useState<BoardView>(() => restingView(game))
  const [settled, setSettled] = useState<Game>(game)
  const shown = useRef<number[]>(game.pits.slice())
  const speedRef = useRef(speed)
  const skipping = useRef(false)
  const wake = useRef<(() => void) | null>(null)

  speedRef.current = speed

  useEffect(() => {
    const last = game.last
    if (game.moves === 0 || !last) {
      shown.current = game.pits.slice()
      setView(restingView(game))
      setSettled(game)
      return
    }

    let cancelled = false
    skipping.current = prefersReducedMotion()

    const step = last.trace.length > LONG_TRACE ? STEP_MS.fast : STEP_MS[speedRef.current]
    const pits = shown.current.slice()
    let hand: BoardView['hand'] = null
    let dropped: number | null = null
    let burstAt: number | null = null
    let note: Note | null = null

    const show = () => {
      if (skipping.current || cancelled) return
      setView({ pits: pits.slice(), hand, dropped, burstAt, note })
    }

    const sound = (name: string) => {
      if (!skipping.current && !cancelled) play(name)
    }

    const pause = (ms: number) =>
      skipping.current
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const timer = window.setTimeout(resolve, ms)
            wake.current = () => {
              window.clearTimeout(timer)
              resolve()
            }
          })

    const run = async () => {
      for (const event of last.trace) {
        if (cancelled) return

        if (event.t === 'pick') {
          pits[event.pit] = 0
          hand = { pit: event.pit, n: event.n }
          sound('dampot')
          show()
          await pause(step * PICK_FACTOR)
        } else if (event.t === 'drop') {
          pits[event.pit] += 1
          hand = hand && { pit: event.pit, n: hand.n - 1 }
          dropped = event.pit
          sound(isUlo(event.pit) ? 'ulo' : 'hulog')
          show()
          await pause(step)
        } else if (event.t === 'capture') {
          const home = ULO[last.player]
          pits[event.pit] = 0
          pits[event.from] = 0
          hand = { pit: event.pit, n: event.n }
          burstAt = event.pit
          sound('huli')
          show()
          await pause(FLY_MS)
          hand = { pit: home, n: event.n }
          show()
          await pause(LAND_MS)
          pits[home] += event.n
          hand = null
          dropped = home
          note = { kind: 'capture', amount: event.n }
          show()
          await pause(LAND_MS)
        } else if (event.t === 'extra') {
          note = { kind: 'extra' }
          sound('ulit')
          show()
          await pause(EXTRA_MS)
        } else {
          hand = null
          show()
        }
      }

      if (cancelled) return

      if (last.passed !== undefined) {
        note = { kind: 'pass', player: last.passed }
        sound('laktaw')
        show()
        await pause(PASS_MS)
      }

      if (cancelled) return

      if (skipping.current) {
        if (last.captured > 0) play('huli')
        else if (last.extra) play('ulit')
      }

      shown.current = game.pits.slice()
      setView({ pits: shown.current.slice(), hand: null, dropped: null, burstAt, note })
      setSettled(game)
    }

    void run()

    return () => {
      cancelled = true
      wake.current?.()
    }
  }, [game])

  const skip = useCallback(() => {
    skipping.current = true
    wake.current?.()
  }, [])

  return { view, settled, busy: settled !== game, skip }
}
