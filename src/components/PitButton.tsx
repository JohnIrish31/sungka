import type { CSSProperties } from 'react'
import { shellLook } from '../assets/assets'
import type { Pit } from '../assets/assets'

const HOUSE_SHELL_CAP = 16
const ULO_SHELL_CAP = 30
const ULO_LONG_SIDE = 61
const ULO_SHORT_SIDE = 11.6

interface PitButtonProps {
  pit: Pit
  count: number
  portrait: boolean
  label: string
  ringed: boolean
  tappable: boolean
  inert: boolean
  justDropped: boolean
  onPlay: () => void
}

function sizeOf(pit: Pit, portrait: boolean): CSSProperties {
  if (!pit.ulo) return { width: `${pit.r * 2}%`, aspectRatio: '1' }
  return portrait
    ? { width: `${ULO_LONG_SIDE}%`, height: `${ULO_SHORT_SIDE}%` }
    : { width: `${ULO_SHORT_SIDE}%`, height: `${ULO_LONG_SIDE}%` }
}

export function PitButton({
  pit,
  count,
  portrait,
  label,
  ringed,
  tappable,
  inert,
  justDropped,
  onPlay,
}: PitButtonProps) {
  const visible = Math.min(count, pit.ulo ? ULO_SHELL_CAP : HOUSE_SHELL_CAP)
  const classes = ['pit', pit.ulo ? 'ulo' : '', ringed ? 'playable' : ''].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      style={{ left: `${pit.x}%`, top: `${pit.y}%`, ...sizeOf(pit, portrait) }}
      aria-label={label}
      aria-disabled={!tappable}
      disabled={inert}
      tabIndex={tappable ? 0 : -1}
      data-pit={pit.index}
      onClick={tappable ? onPlay : undefined}
    >
      <span className="shells">
        {Array.from({ length: visible }, (_, k) => {
          const look = shellLook(pit.index, k)
          const style = {
            left: `${look.left}%`,
            top: `${look.top}%`,
            '--r': `${look.rot}deg`,
          } as CSSProperties
          return (
            <img
              key={k}
              src={look.src}
              alt=""
              style={style}
              className={justDropped && k === visible - 1 ? 'anim-shell-drop' : undefined}
            />
          )
        })}
      </span>
      <span className="count">{count}</span>
    </button>
  )
}
