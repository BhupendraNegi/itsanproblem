import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import useAuth from '../store'

// Fixed warning bar above the navbar while an admin/moderator is acting as
// another user. body.impersonating shifts the navbar and page down.
export function ImpersonationBanner() {
  const { user, impersonator, stopImpersonation } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const active = !!impersonator && !!user

  useEffect(() => {
    document.body.classList.toggle('impersonating', active)
    return () => document.body.classList.remove('impersonating')
  }, [active])

  if (!active) return null

  function handleStop() {
    stopImpersonation()
    // Drop every cached query — it all belongs to the impersonated session.
    queryClient.clear()
    navigate('/admin')
  }

  return (
    <div className="impersonation-banner" role="status">
      <span>
        Impersonating <strong>{user!.name}</strong>
        {user!.username ? <> (@{user!.username})</> : null} — this session is recorded.
      </span>
      <button onClick={handleStop}>Stop impersonating</button>
    </div>
  )
}
