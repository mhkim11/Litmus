import Providers from '@/app/providers'

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
