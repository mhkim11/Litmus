export async function register() {
  if (!process.env.SENTRY_DSN) {
    return // Sentry DSN 없으면 조용히 스킵
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs')
    init({ dsn: process.env.SENTRY_DSN })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({ dsn: process.env.SENTRY_DSN })
  }
}
