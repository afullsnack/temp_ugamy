import ChangePasswordForm from '@/components/auth/change-password-form'
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

const searchSchema = z.object({
    email: z.string().email(),
  })

export const Route = createFileRoute('/change-password')({
  component: RouteComponent,
    validateSearch: searchSchema
})

function RouteComponent() {
    return <div className='w-full h-full'>
        <ChangePasswordForm />
    </div>
}
