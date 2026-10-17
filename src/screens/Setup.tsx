import { useState } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { BOT_LEVELS } from '../game/bots'
import type { Action } from '../game/reducer'
import type { AppState, Format, Mode, Speed } from '../game/types'
import { useMessages } from '../i18n'
import { loadRecords } from '../storage/records'

interface SetupProps {
  state: AppState
  dispatch: Dispatch<Action>
}

interface ChoiceGroupProps<T extends string> {
  legend: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

const SPEEDS: Speed[] = ['slow', 'normal', 'fast']
const NAME_LIMIT = 14

function ChoiceGroup<T extends string>({ legend, value, options, onChange }: ChoiceGroupProps<T>): ReactNode {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="row wrap">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="choice"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Setup({ state, dispatch }: SetupProps) {
  const t = useMessages()
  const { settings } = state
  const [records] = useState(loadRecords)

  const update = (patch: Partial<AppState['settings']>) => dispatch({ type: 'updateSettings', patch })

  const rename = (seat: 0 | 1, value: string) => {
    const names: [string, string] = [...settings.names]
    names[seat] = value.slice(0, NAME_LIMIT)
    update({ names })
  }

  return (
    <main className="screen narrow">
      <h1>{t.setup.title}</h1>

      <ChoiceGroup<Mode>
        legend={t.setup.opponent}
        value={settings.mode}
        onChange={(mode) => update({ mode })}
        options={[
          { value: 'bot', label: t.setup.vsBot },
          { value: 'versus', label: t.setup.vsFriend },
        ]}
      />

      {settings.mode === 'bot' && (
        <div>
          <ChoiceGroup
            legend={t.setup.botLevel}
            value={settings.level}
            onChange={(level) => update({ level })}
            options={BOT_LEVELS.map((level) => ({ value: level, label: t.setup.levels[level] }))}
          />
          <p className="note">{t.setup.wins(records[settings.level].wins)}</p>
        </div>
      )}

      <ChoiceGroup<Format>
        legend={t.setup.length}
        value={settings.format}
        onChange={(format) => update({ format })}
        options={[
          { value: 'laban', label: t.setup.lengthMatch },
          { value: 'mabilis', label: t.setup.lengthQuick },
        ]}
      />

      <ChoiceGroup<Speed>
        legend={t.setup.speed}
        value={settings.speed}
        onChange={(speed) => update({ speed })}
        options={SPEEDS.map((speed) => ({ value: speed, label: t.setup.speeds[speed] }))}
      />

      <fieldset className="field">
        <legend>{t.setup.names}</legend>
        <div className="row wrap">
          {settings.mode === 'versus' ? (
            <>
              <input
                className="text-input"
                value={settings.names[0]}
                placeholder={t.setup.namePlaceholder(1)}
                aria-label={t.setup.namePlaceholder(1)}
                onChange={(event) => rename(0, event.target.value)}
              />
              <input
                className="text-input"
                value={settings.names[1]}
                placeholder={t.setup.namePlaceholder(2)}
                aria-label={t.setup.namePlaceholder(2)}
                onChange={(event) => rename(1, event.target.value)}
              />
            </>
          ) : (
            <input
              className="text-input"
              value={settings.names[0]}
              placeholder={t.players.you}
              aria-label={t.players.you}
              onChange={(event) => rename(0, event.target.value)}
            />
          )}
        </div>
      </fieldset>

      <button type="button" className="btn big accent" onClick={() => dispatch({ type: 'startMatch' })}>
        {t.setup.start}
      </button>
      <button type="button" className="btn big ghost" onClick={() => dispatch({ type: 'navigate', to: 'home' })}>
        {t.nav.back}
      </button>
    </main>
  )
}
