import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings } from '../features/settings/settingsService'

let globalSettings = loadSettings()
const listeners = new Set()

function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'

  const themeColor = document.querySelector('meta[name="theme-color"]')
  if (themeColor) {
    themeColor.setAttribute('content', isDark ? '#0a1120' : '#4169e1')
  }
}

applyTheme(globalSettings.theme)

function updateGlobalSettings(next) {
  globalSettings = next
  listeners.forEach((listener) => listener(next))
}

export function useSettings() {
  const [settings, setSettings] = useState(globalSettings)

  useEffect(() => {
    function handleChange(next) {
      setSettings(next)
    }

    function handleStorage(event) {
      if (event.key !== null && event.key !== 'stockpilot:settings') {
        return
      }

      const next = loadSettings()
      applyTheme(next.theme)
      updateGlobalSettings(next)
    }

    listeners.add(handleChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      listeners.delete(handleChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const updateSettings = useCallback((patch) => {
    const next = saveSettings({ ...globalSettings, ...patch })
    applyTheme(next.theme)
    updateGlobalSettings(next)
    return next
  }, [])

  return { settings, updateSettings }
}
