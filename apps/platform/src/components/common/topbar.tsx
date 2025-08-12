import { Grid3X3, List, Search } from 'lucide-react'
import { Button } from '../ui/button'
import type { Dispatch, FC, SetStateAction } from 'react'
import { show } from '@ebay/nice-modal-react'
import MobileMenu from './mobile-menu'

interface IProps {
    viewMode: "grid" | "list"
    setViewMode: Dispatch<SetStateAction<"grid" | "list">>
    filters: Array<string>
    activeFilter: string
    setActiveFilter: Dispatch<SetStateAction<string>>
}

const Topbar: FC<IProps> = ({ viewMode, setViewMode, filters, activeFilter, setActiveFilter }) => {
    return (
        <div className="fixed top-0 right-0 left-0 lg:left-80 bg-white p-4 lg:p-6 border-b z-30">
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

                    <h1 className="text-xl lg:text-4xl font-bold text-gray-900">Course Episodes</h1>
                </div>
                <Button variant="outline" size="icon">
                    <Search className="w-4 h-4" />
                </Button>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2 flex-wrap">
                    {filters.map((filter) => (
                        <Button
                            key={filter}
                            variant={activeFilter === filter ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter(filter)}
                            className={activeFilter === filter ? "bg-primary rounded-[8px] hover:bg-teal-700" : ""}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-1">
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-[hsla(160,84%,39%,1)] hover:bg-teal-700" : ""}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-[hsla(160,84%,39%,1)] hover:bg-teal-700" : ""}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Topbar