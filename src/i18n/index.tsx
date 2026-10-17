import { createContext, useContext } from 'react'
import type { Lang } from '../game/types'
import { en } from './en'
import type { Messages } from './en'
import { tl } from './tl'

export const MESSAGES: Record<Lang, Messages> = { en, tl }

export const LangContext = createContext<Messages>(en)

export const useMessages = (): Messages => useContext(LangContext)
