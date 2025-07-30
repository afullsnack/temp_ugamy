import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordForm from '@/components/auth/reset-password-form'

export const Route = createFileRoute('/reset-password')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='w-full h-full'>
            <ResetPasswordForm />
        </div>
    )
}
