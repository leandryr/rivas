import { useEffect, useState } from 'react'

type Variant = 'A' | 'B'

export function useABTest(key = 'rivasdev-abtest'): Variant {
  const [variant, setVariant] = useState<Variant>('A')

  useEffect(() => {
    const stored = localStorage.getItem(key) as Variant | null

    if (stored === 'A' || stored === 'B') {
      setVariant(stored)
    } else {
      const assigned = Math.random() < 0.5 ? 'A' : 'B'
      localStorage.setItem(key, assigned)
      setVariant(assigned)
    }
  }, [key])

  return variant
}
