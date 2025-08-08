import { Skeleton } from '../skeleton'
import BrandLogo from '@/components/common/brand-logo'
import type { FC } from 'react'

const SidebarSkeleton: FC = () => {
    return (
        <div
            className={`fixed left-0 top-0 h-full w-80 bg-[hsla(221,39%,11%,1)] flex flex-col items-center z-50 text-white p-6 transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:z-auto overflow-y-auto
`}
        >
            {/* Logo */}
            <div className="w-[233px] h-[233px] flex items-center justify-center mb-[50px]">
                <BrandLogo />
            </div>

            {/* Profile Section */}
            <div className="flex-1">
                <div className="flex flex-col items-center mb-8">
                    <Skeleton className="h-8 w-32 mb-4" />
                </div>

                <div className="space-y-3 text-sm text-center mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>

                <Skeleton className="h-10 w-full mb-8" />
            </div>

            {/* Bottom Actions */}
            <div className="space-y-[50px] mt-auto">
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}

export default SidebarSkeleton
