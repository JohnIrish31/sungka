import { useEffect, useMemo, useState } from 'react'
import type { Dispatch } from 'react'
import { ICON, token } from '../assets/assets'
import type { Pit } from '../assets/assets'
import { Board } from '../components/Board'
import { isHuman, playerName } from '../game/players'
import type { Action } from '../game/reducer'
import { finishRound, legalMoves, matchResult, roundResult, ULO } from '../game/rules'
import type { AppState, Match, Player } from '../game/types'
import { useBoardAnimation } from '../hooks/useBoardAnimation'
import type { Note } from '../hooks/useBoardAnimation'
import { useBotPlayer } from '../hooks/useBotPlayer'
import { usePortrait } from '../hooks/usePortrait'
import { useMessages } from '../i18n'
import { recordOutcome } from '../storage/records'
import type { Outcome } from '../storage/records'

interface GameProps {
  state: AppState
  match: Match
  dispatch: Dispatch<Action>
}

const TOAST_MS = 1600
const PLAYERS: Player[] = [0, 1]
const NO_PITS: ReadonlySet<number> = new Set()

export function Game({ state, match, dispatch }: GameProps) {
  const t = useMessages()
  const portrait = usePortrait()
  const { settings } = state
  const game = match.game

  const { view, busy, skip } = useBoardAnimation(game, settings.speed)
  const thinking = useBotPlayer(state, dispatch, busy)
  const [toast, setToast] = useState<Note | null>(null)

  useEffect(() => {
    setToast(view.note)
    if (!view.note) return
    const timer = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [view.note])

  const tappable = useMemo<ReadonlySet<number>>(() => {
    if (busy || game.done || !isHuman(settings, game.turn)) return NO_PITS
    return new Set(legalMoves(game))
  }, [game, busy, settings])

  const nameOf = (player: Player) => playerName(settings, player, t)
  const roundOver = game.done && !busy
  const lastRound = match.round >= match.rounds

  const describePit = (pit: Pit, count: number) => {
    const owner = nameOf(pit.owner)
    const isYou = settings.mode === 'bot' && pit.owner === 0
    if (pit.ulo) return t.pit.ulo(owner, isYou, count)
    const house = pit.owner === 0 ? pit.index + 1 : pit.index - 7
    return t.pit.house(owner, isYou, house, count)
  }

  const noteText = (note: Note): string => {
    if (note.kind === 'extra') return t.game.extra
    if (note.kind === 'capture') return t.game.capture(note.amount)
    return t.game.passed(nameOf(note.player))
  }

  const statusText = (): string => {
    if (roundOver) return t.game.roundOver(match.round)
    if (busy) return t.game.sowing
    if (thinking) return t.game.botThinking(nameOf(game.turn))
    return settings.mode === 'bot' ? t.game.yourTurn : t.game.playerTurn(nameOf(game.turn))
  }

  const finishRoundAndContinue = () => {
    if (lastRound && settings.mode === 'bot') {
      const { winner } = matchResult(finishRound(match))
      const outcome: Outcome = winner === null ? 'draw' : winner === 0 ? 'win' : 'loss'
      recordOutcome(settings.level, outcome)
    }
    dispatch({ type: 'nextRound' })
  }

  const scores = roundResult(game).scores

  return (
    <main className="screen game">
      <div className="players">
        {PLAYERS.map((player) => (
          <div
            key={player}
            className={player === game.turn && !game.done ? 'player active' : 'player'}
            aria-current={player === game.turn && !game.done ? 'true' : undefined}
          >
            <img src={token(player)} alt="" />
            <span className="player-name">{nameOf(player)}</span>
            <strong className="player-score" aria-label={`${t.game.ulo}: ${view.pits[ULO[player]]}`}>
              {view.pits[ULO[player]]}
            </strong>
          </div>
        ))}
      </div>

      <p className="round-line">
        <strong>{t.game.round(match.round, match.rounds)}</strong>
        <span>
          {t.game.totals}: {nameOf(0)} {match.totals[0] + view.pits[ULO[0]]} &middot; {nameOf(1)}{' '}
          {match.totals[1] + view.pits[ULO[1]]}
        </span>
      </p>

      <p className="hint" aria-live="polite">
        {thinking && <img className="hint-icon anim-wobble" src={ICON.robot} alt="" />}
        {statusText()}
      </p>

      <Board
        pits={view.pits}
        portrait={portrait}
        label={t.game.board}
        describe={describePit}
        ringed={tappable}
        tappable={tappable}
        onPlay={(pit) => dispatch({ type: 'play', pit })}
        hand={view.hand}
        dropped={view.dropped}
        burstAt={view.burstAt}
      />

      <div className="row wrap">
        <button type="button" className={busy ? 'btn ghost' : 'btn ghost invisible'} onClick={skip} tabIndex={busy ? 0 : -1}>
          {t.game.skip}
        </button>
      </div>

      {roundOver && (
        <section className="panel intermission anim-slide-up">
          <div className="banner">{t.game.roundOver(match.round)}</div>
          <p className="final-score">
            {nameOf(0)} {scores[0]} &middot; {nameOf(1)} {scores[1]}
          </p>
          <button type="button" className="btn big accent" onClick={finishRoundAndContinue}>
            {lastRound ? t.game.seeResult : t.game.nextRound}
          </button>
        </section>
      )}

      {toast && (
        <div className="toast anim-pop" role="status">
          {noteText(toast)}
        </div>
      )}
    </main>
  )
}
