import { useState } from 'react'
import { useFlagMutation } from '../hooks/useMutations'

const FLAG_REASONS = [
  { value: 'harm', label: 'Harmful' },
  { value: 'spam', label: 'Spam' },
  { value: 'identifying_info', label: 'Identifying info' },
]

interface FlagButtonProps {
  target: 'posts' | 'comments'
  id: number
  // compact: inline text-only trigger for comment meta lines
  compact?: boolean
}

export function FlagButton({ target, id, compact = false }: FlagButtonProps) {
  const flagMutation = useFlagMutation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [reported, setReported] = useState(false)

  function handleFlag(reason: string) {
    flagMutation.mutate(
      { target, id, reason },
      { onSuccess: () => setReported(true) }
    )
    setMenuOpen(false)
  }

  if (reported) {
    return <span className={`action-btn is-active${compact ? ' comment-helpful' : ''}`}>Reported ✓</span>
  }

  return (
    <>
      <button
        className={`action-btn${compact ? ' comment-helpful' : ''}`}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {!compact && <img src="/assets/icons/flag.svg" alt="" />}
        Flag
      </button>
      {menuOpen && (
        <span className="flag-menu">
          {FLAG_REASONS.map(({ value, label }) => (
            <button
              key={value}
              className={`action-btn${compact ? ' comment-helpful' : ''}`}
              onClick={() => handleFlag(value)}
              disabled={flagMutation.isPending}
            >
              {label}
            </button>
          ))}
        </span>
      )}
    </>
  )
}
