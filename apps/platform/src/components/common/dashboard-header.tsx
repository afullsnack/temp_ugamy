import { Grid3X3, List } from 'lucide-react'
import { Button } from '../ui/button'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { Dispatch, FC, SetStateAction } from 'react'
import { cn } from '@/lib/utils'

interface IProps {
    viewMode: "grid" | "list"
    setViewMode: Dispatch<SetStateAction<"grid" | "list">>
    filters: Array<string>
}

export const DashboardHeader: FC<IProps> = ({ viewMode, setViewMode, filters }) => {
    const navigate = useNavigate({ from: "/dashboard" })
    const search = useSearch({ from: "/dashboard" })

    const activeFilter = (search?.filter as string) ?? "All"

    const handleFilterClick = (filter: 'All' | 'Watched' | 'Favourites') => {
        navigate({
            search: (prev) => ({
                ...prev,
                filter,
            }),
        })
    }

    return (
        <div className="bg-white bg-gradient-to-br from-primary/20 via-background to-accent/5 p-4 lg:p-6 pt-[90px] lg:pt-[100px] border-b z-30">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h1 className="text-xl lg:text-4xl font-bold text-gray-900">Courses & Lessons</h1>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2 flex-wrap">
                    {filters.map((filter) => (
                        <Button
                            key={filter}
                            variant={activeFilter === filter ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterClick(filter as 'All' | 'Watched' | 'Favourites')}
                            className={
                                activeFilter === filter
                                    ? "bg-primary rounded-[8px] hover:bg-teal-700"
                                    : ""
                            }
                        >
                            {filter}
                        </Button>
                    ))}
                </div>

                <div className={cn("hidden lg:visible lg:flex gap-1", activeFilter !== "All" ? "!hidden" : "lg:visible")}>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={
                            viewMode === "list"
                                ? "bg-[hsla(160,84%,39%,1)] hover:bg-teal-700"
                                : ""
                        }
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className={
                            viewMode === "grid"
                                ? "bg-[hsla(160,84%,39%,1)] hover:bg-teal-700"
                                : ""
                        }
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
