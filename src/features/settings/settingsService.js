import { readStorage, writeStorage } from '../../services/storage'

const STORAGE_KEY = 'settings'

export const THEMES = ['light', 'dark']

export const DEFAULT_SETTINGS = {
  businessName: 'My Business',
  contactEmail: '',
  phoneNumber: '',
  businessAddress: '',
  lowStockThreshold: 0,
  theme: 'light',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/

function clampThreshold(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) {
    return 0
  }
  return Math.min(100000, Math.floor(number))
}

export function normaliseSettings(input) {
  const source = input && typeof input === 'object' ? input : {}

  return {
    businessName:
      String(source.businessName ?? '').trim() || DEFAULT_SETTINGS.businessName,
    contactEmail: String(source.contactEmail ?? '').trim(),
    phoneNumber: String(source.phoneNumber ?? '').trim(),
    businessAddress: String(source.businessAddress ?? '').trim(),
    lowStockThreshold: clampThreshold(source.lowStockThreshold),
    theme: THEMES.includes(source.theme) ? source.theme : DEFAULT_SETTINGS.theme,
  }
}

export function loadSettings() {
  return normaliseSettings(readStorage(STORAGE_KEY, {}))
}

export function saveSettings(input) {
  const normalised = normaliseSettings(input)
  writeStorage(STORAGE_KEY, normalised)
  return normalised
}

export function validateBusinessProfile(values) {
  const errors = {}
  const businessName = String(values.businessName ?? '').trim()
  const contactEmail = String(values.contactEmail ?? '').trim()
  const phoneNumber = String(values.phoneNumber ?? '').trim()
  const businessAddress = String(values.businessAddress ?? '').trim()

  if (!businessName) {
    errors.businessName = 'Business name is required.'
  } else if (businessName.length > 80) {
    errors.businessName = 'Business name must be 80 characters or less.'
  }

  if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) {
    errors.contactEmail = 'Enter a valid email address.'
  } else if (contactEmail.length > 120) {
    errors.contactEmail = 'Email address must be 120 characters or less.'
  }

  if (phoneNumber && !PHONE_PATTERN.test(phoneNumber)) {
    errors.phoneNumber =
      'Use 7 to 20 characters: numbers, spaces, +, -, or parentheses.'
  }

  if (businessAddress.length > 200) {
    errors.businessAddress = 'Address must be 200 characters or less.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateLowStockThreshold(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Enter a threshold, or use 0 for product thresholds only.'
  }

  const number = Number(value)

  if (!Number.isFinite(number) || !Number.isInteger(number)) {
    return 'Threshold must be a whole number.'
  }

  if (number < 0) {
    return 'Threshold cannot be negative.'
  }

  if (number > 100000) {
    return 'Threshold must be 100,000 or less.'
  }

  return ''
}
