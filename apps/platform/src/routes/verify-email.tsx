import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import VerifyEmailForm from '@/components/auth/verify-email-form'
import { BrandLogoDark } from '@/components/common/brand-logo-dark'

const searchSchema = z.object({
    email: z.string().optional()
  })

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent,
    validateSearch: searchSchema
})

function RouteComponent() {
  return (
      <div className="bg-white flex flex-col min-h-screen items-center justify-start space-y-[32px] pt-[100px] px-4 pb-4">
          <BrandLogoDark />
          <VerifyEmailForm />
      </div>
  )
}
