import { useEffect, useRef, useState } from 'react'

const API_BASE = 'http://localhost:5001/api'

function readLocal(key, initialValue) {
  if (typeof window === 'undefined') return initialValue

  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  } catch {
    return initialValue
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Keep the app usable even when browser storage is unavailable.
  }
}

export function useDatabaseState(key, initialValue) {
  const [value, setValue] = useState(() => readLocal(key, initialValue))
  const [databaseReady, setDatabaseReady] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    let active = true

    fetch(`${API_BASE}/state/${encodeURIComponent(key)}`)
      .then(res => {
        if (!res.ok) throw new Error('Database load failed')
        return res.json()
      })
      .then(data => {
        if (!active) return
        if (data.value !== null) setValue(data.value)
        setDatabaseReady(true)
      })
      .catch(() => {
        if (active) setDatabaseReady(false)
      })

    return () => {
      active = false
    }
  }, [key])

  useEffect(() => {
    writeLocal(key, value)

    if (!databaseReady) return undefined
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      fetch(`${API_BASE}/state/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      }).catch(() => {})
    }, 250)

    return () => window.clearTimeout(saveTimer.current)
  }, [databaseReady, key, value])

  return [value, setValue, databaseReady]
}
