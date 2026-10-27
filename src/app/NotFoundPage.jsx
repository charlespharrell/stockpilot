import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found · StockPilot')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button as={Link} to="/" variant="primary" className="mt-6">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Button>
    </div>
  )
}
