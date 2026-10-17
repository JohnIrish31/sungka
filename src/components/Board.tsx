import type { KeyboardEvent } from 'react'
import { BOARD, GAME_ICON, OVERLAY, PITS } from '../assets/assets'
import type { Pit } from '../assets/assets'
import type { BoardView } from '../hooks/useBoardAnimation'
import { PitButton } from './PitButton'

interface BoardProps {
  pits: number[]
  portrait: boolean
  label: string
  describe?: (pit: Pit, count: number) => string
  ringed?: ReadonlySet<number>
  tappable?: ReadonlySet<number>
  onPlay?: (pit: number) => void
  hand?: BoardView['hand']
  dropped?: number | null
  burstAt?: number | null
  decorative?: boolean
}

const NO_PITS: ReadonlySet<number> = new Set()
const FORWARD_KEYS = ['ArrowRight', 'ArrowDown']
const BACKWARD_KEYS = ['ArrowLeft', 'ArrowUp']

export function Board({
  pits,
  portrait,
  label,
  describe = (pit, count) => `${pit.index}: ${count}`,
  ringed = NO_PITS,
  tappable = NO_PITS,
  onPlay,
  hand = null,
  dropped = null,
  burstAt = null,
  decorative = false,
}: BoardProps) {
  const layout = portrait ? PITS.portrait : PITS.landscape
  const burst = burstAt === null ? null : layout[burstAt]
  const holding = hand && hand.n > 0 ? { spot: layout[hand.pit], n: hand.n } : null

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = FORWARD_KEYS.includes(event.key)
    if (!forward && !BACKWARD_KEYS.includes(event.key)) return

    const along = (index: number) => (portrait ? layout[index].y : layout[index].x)
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.pit.playable'))
      .filter((button) => button.tabIndex === 0)
      .sort((a, b) => along(Number(a.dataset.pit)) - along(Number(b.dataset.pit)))
    if (buttons.length === 0) return

    event.preventDefault()
    const current = buttons.findIndex((button) => button === document.activeElement)
    const target = current === -1 ? 0 : (current + (forward ? 1 : -1) + buttons.length) % buttons.length
    buttons[target].focus()
  }

  return (
    <div
      className={portrait ? 'sungka portrait' : 'sungka'}
      role={decorative ? undefined : 'group'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      onKeyDown={decorative ? undefined : moveFocus}
    >
      <img className="board-img" src={portrait ? BOARD.portrait : BOARD.landscape} alt="" />

      {layout.map((pit) => (
        <PitButton
          key={pit.index}
          pit={pit}
          count={pits[pit.index]}
          portrait={portrait}
          label={describe(pit, pits[pit.index])}
          ringed={ringed.has(pit.index)}
          tappable={tappable.has(pit.index)}
          inert={decorative}
          justDropped={dropped === pit.index}
          onPlay={() => onPlay?.(pit.index)}
        />
      ))}

      {burst && (
        <img
          className="capture-fx anim-capture-pop"
          src={OVERLAY.capture}
          alt=""
          style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
        />
      )}

      {holding && (
        <div className="hand-shells" style={{ left: `${holding.spot.x}%`, top: `${holding.spot.y}%` }} aria-hidden="true">
          <img src={GAME_ICON.kamay} alt="" />
          <span>{holding.n}</span>
        </div>
      )}
    </div>
  )
}
