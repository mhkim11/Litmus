import type { EventType } from '@/lib/db/schema'

/**
 * Sends a visitor event to /api/events.
 * Uses navigator.sendBeacon when available; falls back to fetch with keepalive.
 * Fire-and-forget: callers do not need to await this.
 * No-op when called outside a browser environment.
 */
export function trackEvent(
  ideaId: string,
  eventType: EventType,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return

  const payload = JSON.stringify({ ideaId, eventType, metadata })

  const sent = navigator.sendBeacon(
    '/api/events',
    new Blob([payload], { type: 'text/plain;charset=UTF-8' })
  )

  if (!sent) {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // best-effort: ignore errors silently
    })
  }
}
