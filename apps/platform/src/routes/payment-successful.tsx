import { createFileRoute } from '@tanstack/react-router'
import { PaymentSuccessWidget } from '@/components/common/payment-success-widget'

export const Route = createFileRoute('/payment-successful')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <PaymentSuccessWidget />
        </>
    )
}
