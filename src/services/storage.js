const STORAGE_PREFIX = 'stockpilot:'

function getStorageKey(key) {
  return `${STORAGE_PREFIX}${key}`
}

export function readStorage(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(getStorageKey(key))
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(getStorageKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function snapshotStorage(key) {
  try {
    const raw = window.localStorage.getItem(getStorageKey(key))
    return { ok: true, exists: raw !== null, raw }
  } catch {
    return { ok: false, exists: false, raw: null }
  }
}

export function restoreStorageSnapshot(key, snapshot) {
  if (!snapshot?.ok) {
    return false
  }

  try {
    if (snapshot.exists) {
      window.localStorage.setItem(getStorageKey(key), snapshot.raw)
    } else {
      window.localStorage.removeItem(getStorageKey(key))
    }
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(getStorageKey(key))
  } catch {
    return
  }
}
