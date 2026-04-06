import { z } from 'zod'

export const LandingPageData = z.object({
  hero: z.object({
    title: z.string().min(1).max(200),
    subtitle: z.string().min(1).max(500),
  }),
  valueProps: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1).max(300),
      })
    )
    .length(3),
  cta: z.object({
    buttonText: z.string().min(1).max(50),
    comingSoonMessage: z.string().min(1).max(200),
  }),
  emailForm: z.object({
    label: z.string().min(1).max(100),
    placeholder: z.string().min(1).max(100),
    consentText: z.string().min(1).max(300),
  }),
})

export type LandingPageData = z.infer<typeof LandingPageData>
