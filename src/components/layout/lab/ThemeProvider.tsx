'use client'

import { useEffect } from 'react'
import { Theme } from '@/types/lab'

interface ThemeProviderProps {
  theme: Theme
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
      root.classList.toggle('light', theme === 'light')
    }
  }, [theme])

  return <>{children}</>
}
