import { List } from 'lucide-react'
import { Button } from '../ui/button'
import { show } from '@ebay/nice-modal-react'
import MobileMenu from '../common/mobile-menu'
import type { FC } from 'react'

interface IProps {
    title: string
}

export const CourseDetailsHeader: FC<IProps> = ({ title }) => {
    return (
        <div className="bg-white p-4 lg:p-6 border-b z-30">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="lg:hidden bg-transparent"
                        onClick={() => show(MobileMenu)}
                    >
                        <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
                            <List className="w-4 h-4 text-[hsla(160,84%,39%,1)]" />
                        </div>
                    </Button>

                    <h1 className="text-xl lg:text-4xl font-bold text-gray-900">{title}</h1>
                </div>
            </div>
        </div>
    )
}