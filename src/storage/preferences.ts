import type { Lang, Speed } from '../game/types'
import { readJson, writeJson } from './safeStorage'

const KEY = 'sungka.preferences.v1'

export interface Preferences {
  lang: Lang
  speed: Speed
  muted: boolean
}

const DEFAULTS: Preferences = { lang: 'en', speed: 'normal', muted: false }

const isLang = (value: unknown): value is Lang => value === 'en' || value === 'tl'
const isSpeed = (value: unknown): value is Speed =>
  value === 'slow' || value === 'normal' || value === 'fast'

export function loadPreferences(): Preferences {
  const saved = readJson<Partial<Preferences>>(KEY, {})
  return {
    lang: isLang(saved.lang) ? saved.lang : DEFAULTS.lang,
    speed: isSpeed(saved.speed) ? saved.speed : DEFAULTS.speed,
    muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULTS.muted,
  }
}

export function savePreferences(preferences: Preferences): void {
  writeJson(KEY, preferences)
}
