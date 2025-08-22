import { createFileRoute } from '@tanstack/react-router'
import { PaymentSuccessWidget } from '@/components/common/payment-success-widget'
import Topbar from '@/components/common/topbar'

export const Route = createFileRoute('/payment-successful')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='relative bg-gray-100 w-full min-h-screen h-fit'>
            <Topbar />
            <PaymentSuccessWidget />
        </div>
    )
}
