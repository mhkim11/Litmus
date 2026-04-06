import LegalDisclaimerFooter from '@/components/published/LegalDisclaimerFooter'

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LegalDisclaimerFooter />
    </>
  )
}
