import type { FC } from "react";
import { BookOpen } from "lucide-react";

export const CoursesEmptyStateWidget: FC = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
        <p className="text-gray-500 max-w-sm">
            There are no courses to display at the moment. Check back later for new content.
        </p>
    </div>
)