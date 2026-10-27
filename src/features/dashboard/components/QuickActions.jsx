import { ArrowRight, FileText, Package, ReceiptText, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

const actions = [
  {
    label: 'Go to Inventory',
    description: 'View products and stock (module not yet implemented).',
    icon: Package,
    to: '/inventory',
  },
  {
    label: 'Go to Sales',
    description: 'Review transactions (module not yet implemented).',
    icon: ReceiptText,
    to: '/sales',
  },
  {
    label: 'Go to Expenses',
    description: 'Track spending (module not yet implemented).',
    icon: Wallet,
    to: '/expenses',
  },
  {
    label: 'View Reports',
    description: 'Performance insights (module not yet implemented).',
    icon: FileText,
    to: '/reports',
  },
]

export default function QuickActions() {
  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Quick actions</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Navigate to modules. These are routes only — business actions are
            not implemented yet.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {actions.map((action) => (
          <Button
            key={action.to}
            as={Link}
            to={action.to}
            variant="ghost"
            size="md"
            className="h-auto w-full justify-between rounded-xl px-3 py-2.5 text-left"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-canvas text-ink-muted">
                <action.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">
                  {action.label}
                </span>
                <span className="block text-xs text-ink-muted">
                  {action.description}
                </span>
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-ink-muted/60"
              aria-hidden="true"
            />
          </Button>
        ))}
      </div>
    </Card>
  )
}
