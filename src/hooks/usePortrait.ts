import { useEffect, useState } from 'react'

const NARROW_PX = 520

const shouldUsePortrait = (): boolean =>
  window.innerWidth < NARROW_PX && window.innerHeight > window.innerWidth

export function usePortrait(): boolean {
  const [portrait, setPortrait] = useState(shouldUsePortrait)

  useEffect(() => {
    const update = () => setPortrait(shouldUsePortrait())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return portrait
}
