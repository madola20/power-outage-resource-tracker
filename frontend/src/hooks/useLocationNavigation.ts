import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface LocationLike {
  id?: string
  status?: string
}

interface NavigateOptions<T = any> {
  onResolved?: (location: T) => void
  onBeforeNavigate?: () => void
}

export const useLocationNavigation = () => {
  const navigate = useNavigate()

  const navigateToLocation = useCallback(
    <T extends LocationLike>(location: T, options?: NavigateOptions<T>) => {
      if (!location || !location.id) return

      if (location.status === 'resolved') {
        options?.onResolved?.(location)
        return
      }

      options?.onBeforeNavigate?.()
      navigate(`/location/${location.id}`)
    },
    [navigate]
  )

  return { navigateToLocation }
}
