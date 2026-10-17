import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { ICON, token } from '../assets/assets'
import { play } from '../assets/audio/sounds'
import { launchConfetti } from '../assets/fx'
import { BOT_LEVELS } from '../game/bots'
import { playerName } from '../game/players'
import type { Action } from '../game/reducer'
import { matchResult } from '../game/rules'
import type { AppState, Match, Player } from '../game/types'
import { useMessages } from '../i18n'
import { loadRecords } from '../storage/records'

interface ResultProps {
  state: AppState
  match: Match
  dispatch: Dispatch<Action>
}

type Verdict = 'win' | 'loss' | 'draw'

const PLAYERS: Player[] = [0, 1]

export function Result({ state, match, dispatch }: ResultProps) {
  const t = useMessages()
  const { settings } = state
  const [records] = useState(loadRecords)
  const celebrated = useRef(false)

  const { winner } = matchResult(match)
  const vsBot = settings.mode === 'bot'
  const verdict: Verdict = winner === null ? 'draw' : vsBot && winner === 1 ? 'loss' : 'win'
  const nameOf = (player: Player) => playerName(settings, player, t)

  useEffect(() => {
    if (celebrated.current) return
    celebrated.current = true
    if (verdict === 'loss') {
      play('lose')
    } else if (verdict === 'draw') {
      play('pop')
    } else {
      play('win')
      launchConfetti()
    }
  }, [verdict])

  const headline = (): string => {
    if (winner === null) return t.result.draw
    if (!vsBot) return t.result.winner(nameOf(winner))
    return winner === 0 ? t.result.youWin : t.result.youLose
  }

  return (
    <main className="screen narrow result">
      <div className="banner anim-pop">
        {winner !== null && <img className="banner-icon" src={token(winner)} alt="" />}
        <img className="banner-icon" src={ICON.trophy} alt="" />
        <span>{headline()}</span>
      </div>

      <section className="panel">
        <h2>{t.result.rounds}</h2>
        <table className="score-table">
          <thead>
            <tr>
              <th scope="col" />
              {PLAYERS.map((player) => (
                <th key={player} scope="col">
                  {nameOf(player)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {match.history.map((scores, index) => (
              <tr key={index}>
                <th scope="row">{t.result.round(index + 1)}</th>
                <td>{scores[0]}</td>
                <td>{scores[1]}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t.result.total}</th>
              <td>{match.totals[0]}</td>
              <td>{match.totals[1]}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {vsBot && (
        <section className="panel">
          <h2>{t.result.record}</h2>
          <ul className="records">
            {BOT_LEVELS.map((level) => (
              <li key={level}>
                <strong>{t.setup.levels[level]}</strong>
                <span>
                  {t.result.recordRow(records[level].wins, records[level].losses, records[level].draws)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" className="btn big accent" onClick={() => dispatch({ type: 'startMatch' })}>
        {t.result.playAgain}
      </button>
      <button type="button" className="btn big ghost" onClick={() => dispatch({ type: 'navigate', to: 'home' })}>
        {t.result.home}
      </button>
    </main>
  )
}
