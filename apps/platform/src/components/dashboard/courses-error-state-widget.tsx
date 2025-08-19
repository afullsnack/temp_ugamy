import type { FC } from "react";
import { Button } from "../ui/button";

interface IProps {
    error: Error | null
}


export const CoursesErrorStateWidget: FC<IProps> = (error) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">⚠</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading courses</h3>
        <p className="text-gray-500 max-w-sm mb-4">{error?.error?.message ?? "An Unexpected error occured"}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
        </Button>
    </div>
)