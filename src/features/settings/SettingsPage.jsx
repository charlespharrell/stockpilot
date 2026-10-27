import { useState } from 'react'
import {
  BellRing,
  CircleCheck,
  HardDrive,
  Moon,
  Save,
  ShieldCheck,
  Store,
  Sun,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import Textarea from '../../components/ui/Textarea'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useSettings } from '../../hooks/useSettings'
import { cn } from '../../utils/cn'
import { resetAndLoadDemoData } from '../../utils/resetDemoData'
import {
  validateBusinessProfile,
  validateLowStockThreshold,
} from './settingsService'

const demoResetEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_RESET === 'true'

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces with dark text.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'A low-light palette for dim rooms.',
    icon: Moon,
  },
]

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  useDocumentTitle('Settings · StockPilot')

  const { settings, updateSettings } = useSettings()
  const [profile, setProfile] = useState({
    businessName: settings.businessName,
    contactEmail: settings.contactEmail,
    phoneNumber: settings.phoneNumber,
    businessAddress: settings.businessAddress,
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileMessage, setProfileMessage] = useState('')
  const [thresholdInput, setThresholdInput] = useState(
    String(settings.lowStockThreshold),
  )
  const [thresholdError, setThresholdError] = useState('')
  const [thresholdMessage, setThresholdMessage] = useState('')
  const [isResettingDemo, setIsResettingDemo] = useState(false)
  const [demoResetMessage, setDemoResetMessage] = useState('')
  const [demoResetError, setDemoResetError] = useState('')

  function updateProfileField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
    setProfileErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
    setProfileMessage('')
  }

  function handleProfileSubmit(event) {
    event.preventDefault()

    const result = validateBusinessProfile(profile)
    setProfileErrors(result.errors)

    if (!result.valid) {
      setProfileMessage('')
      return
    }

    const saved = updateSettings({
      businessName: profile.businessName,
      contactEmail: profile.contactEmail,
      phoneNumber: profile.phoneNumber,
      businessAddress: profile.businessAddress,
    })

    setProfile({
      businessName: saved.businessName,
      contactEmail: saved.contactEmail,
      phoneNumber: saved.phoneNumber,
      businessAddress: saved.businessAddress,
    })
    setProfileMessage('Business profile saved.')
  }

  function handleThresholdSubmit(event) {
    event.preventDefault()

    const error = validateLowStockThreshold(thresholdInput)
    setThresholdError(error)

    if (error) {
      setThresholdMessage('')
      return
    }

    const saved = updateSettings({
      lowStockThreshold: Number(thresholdInput),
    })

    setThresholdInput(String(saved.lowStockThreshold))
    setThresholdMessage('Low-stock alert level saved.')
  }

  function handleDemoReset() {
    if (isResettingDemo) {
      return
    }

    const confirmed = window.confirm(
      'Load Demo Data\n\nThis will REPLACE your current inventory, sales, and expenses with generated demo data. This cannot be undone.\n\nContinue?',
    )

    if (!confirmed) {
      return
    }

    setIsResettingDemo(true)
    setDemoResetMessage('')
    setDemoResetError('')

    try {
      const result = resetAndLoadDemoData()

      if (result.success) {
        setDemoResetMessage(
          `Demo data loaded: ${result.counts.products} products, ${result.counts.sales} sales, ${result.counts.expenses} expenses. Reloading...`,
        )
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setDemoResetError(result.error || 'Demo data could not be loaded.')
      }
    } catch (error) {
      setDemoResetError(`Demo data could not be loaded: ${error.message}`)
    } finally {
      setIsResettingDemo(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Choose how StockPilot looks, keep your business details handy, and set a consistent low-stock alert level. Everything here is stored only in this browser."
      >
        <Badge tone="brand">
          <HardDrive className="size-3.5" aria-hidden="true" />
          Local settings
        </Badge>
      </PageHeader>

      <div className="mt-6 space-y-6">
        <Card className="p-5 sm:p-6">
          <SectionHeading
            icon={Sun}
            title="Appearance"
            description="Switch between light and dark modes. Your choice is applied immediately and remembered on this device."
          />

          <div
            className="mt-5 grid gap-3 sm:grid-cols-2"
            role="group"
            aria-label="Theme"
          >
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = settings.theme === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    updateSettings({ theme: option.value })
                  }}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                    isActive
                      ? 'border-brand bg-brand-50'
                      : 'border-line bg-surface hover:border-brand-200 hover:bg-brand-50',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg border',
                      isActive
                        ? 'border-brand-200 bg-surface text-brand'
                        : 'border-line bg-canvas text-ink-muted',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-ink-muted">
                      {option.description}
                    </span>
                  </span>
                  {isActive ? (
                    <CircleCheck
                      className="ml-auto size-4 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <Card className="p-5 sm:p-6">
            <SectionHeading
              icon={Store}
              title="Business profile"
              description="Used for your own reference in this workspace. StockPilot does not create or verify an account."
            />

            <form className="mt-5" onSubmit={handleProfileSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    id="business-name"
                    label="Business name"
                    value={profile.businessName}
                    maxLength={80}
                    autoComplete="organization"
                    onChange={(event) =>
                      updateProfileField('businessName', event.target.value)
                    }
                    error={profileErrors.businessName}
                    placeholder="My Business"
                  />
                </div>
                <Input
                  id="contact-email"
                  label="Contact email (optional)"
                  type="email"
                  value={profile.contactEmail}
                  maxLength={120}
                  autoComplete="email"
                  onChange={(event) =>
                    updateProfileField('contactEmail', event.target.value)
                  }
                  error={profileErrors.contactEmail}
                  placeholder="you@example.com"
                />
                <Input
                  id="phone-number"
                  label="Phone number (optional)"
                  type="tel"
                  value={profile.phoneNumber}
                  maxLength={20}
                  autoComplete="tel"
                  onChange={(event) =>
                    updateProfileField('phoneNumber', event.target.value)
                  }
                  error={profileErrors.phoneNumber}
                  placeholder="+234 801 234 5678"
                />
                <div className="sm:col-span-2">
                  <Textarea
                    id="business-address"
                    label="Business address (optional)"
                    value={profile.businessAddress}
                    maxLength={200}
                    rows={3}
                    autoComplete="street-address"
                    onChange={(event) =>
                      updateProfileField('businessAddress', event.target.value)
                    }
                    error={profileErrors.businessAddress}
                    placeholder="Street, city, state"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm">
                  <Save className="size-4" aria-hidden="true" />
                  Save profile
                </Button>
                <span
                  role="status"
                  className="text-xs font-medium text-emerald-700"
                >
                  {profileMessage}
                </span>
              </div>
            </form>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              icon={BellRing}
              title="Low-stock alerts"
              description="Set a workspace minimum alert level. A product is low when its quantity is above 0 and at or below its own threshold or this value."
            />

            <form className="mt-5" onSubmit={handleThresholdSubmit} noValidate>
              <Input
                id="low-stock-threshold"
                label="Workspace alert threshold"
                type="number"
                min="0"
                max="100000"
                step="1"
                inputMode="numeric"
                value={thresholdInput}
                onChange={(event) => {
                  setThresholdInput(event.target.value)
                  setThresholdError('')
                  setThresholdMessage('')
                }}
                error={thresholdError}
              />

              <p className="mt-2 text-xs leading-5 text-ink-muted">
                Use 0 to rely only on each product&apos;s own threshold. Saving
                this setting does not change product records or quantities.
              </p>

              <div className="mt-4 rounded-xl border border-line bg-canvas/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Saved alert level
                </p>
                <p className="mt-1.5 text-sm leading-6 text-ink">
                  {settings.lowStockThreshold > 0
                    ? `The higher of each product's saved threshold or ${settings.lowStockThreshold} applies.`
                    : 'Each product uses its own saved threshold.'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm">
                  <Save className="size-4" aria-hidden="true" />
                  Save alert level
                </Button>
                <span
                  role="status"
                  className="text-xs font-medium text-emerald-700"
                >
                  {thresholdMessage}
                </span>
              </div>
            </form>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <SectionHeading
            icon={ShieldCheck}
            title="Data safety"
            description="Settings are stored separately from your inventory, sales, and expenses. Saving them never changes your business records."
          />

          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted">
            Backup and restore are not included yet. A safe restore needs
            explicit confirmation and validation before replacing local data, so
            it belongs in a separate flow rather than this settings form.
          </p>

          {demoResetEnabled ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
                Development tool
              </p>
              <p className="mt-1.5 max-w-3xl text-xs leading-5 text-rose-700">
                Replace all inventory, sales, and expenses with generated demo
                records. This control is only available in development or when
                the demo-reset environment flag is explicitly enabled.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDemoReset}
                  disabled={isResettingDemo}
                  className="border-rose-300 text-rose-700"
                >
                  {isResettingDemo ? 'Loading demo data...' : 'Reset and load demo data'}
                </Button>
                {demoResetMessage ? (
                  <span
                    role="status"
                    className="text-xs font-medium text-rose-700"
                  >
                    {demoResetMessage}
                  </span>
                ) : null}
              </div>
              {demoResetError ? (
                <p role="alert" className="mt-2 text-xs font-medium leading-5 text-rose-700">
                  {demoResetError}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </>
  )
}
