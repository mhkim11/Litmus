'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/utils/tracking'

interface TrackingBoundaryProps {
  ideaId: string
}

export default function TrackingBoundary({ ideaId }: TrackingBoundaryProps) {
  useEffect(() => {
    trackEvent(ideaId, 'page_view')
  }, [ideaId])

  return null
}
