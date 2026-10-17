import type { Messages } from '../i18n/en'
import type { Player, Settings } from './types'

export function playerName(settings: Settings, player: Player, t: Messages): string {
  const custom = settings.names[player].trim()
  if (custom) return custom
  if (settings.mode === 'bot') return player === 0 ? t.players.you : t.players.bot
  return t.players.numbered(player + 1)
}

export const isHuman = (settings: Settings, player: Player): boolean =>
  settings.mode === 'versus' || player === 0
