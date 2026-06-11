import { useState } from 'react'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  minLength?: number
  required?: boolean
}

export function PasswordInput({ value, onChange, placeholder, autoComplete, minLength, required }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="password-input">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <img src={visible ? '/assets/icons/eye-off.svg' : '/assets/icons/eye.svg'} alt="" />
      </button>
    </span>
  )
}
