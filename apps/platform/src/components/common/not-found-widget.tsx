"use client"

import { useState } from "react"
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Compass, FileQuestion, Home, Search } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


export default function Component() {
    const [searchQuery, setSearchQuery] = useState("")

    const popularPages = [
        { name: "Home", href: "/", icon: Home },
        { name: "About", href: "/about", icon: FileQuestion },
        { name: "Services", href: "/services", icon: Compass },
        { name: "Contact", href: "/contact", icon: FileQuestion },
    ]

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle search functionality here
        console.log("Searching for:", searchQuery)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* 404 Illustration */}
                <div className="relative">
                    <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">404</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <FileQuestion className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Oops! Page Not Found</h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved. Let's get you back on track!
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search for pages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" size="sm">
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="gap-2">
                        <Link to="/">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2 bg-transparent" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>

                {/* Popular Pages */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Popular Pages</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {popularPages.map((page) => {
                            const Icon = page.icon
                            return (
                                <Card key={page.name} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4">
                                        <Link to={page.href} className="flex flex-col items-center gap-2 text-sm">
                                            <Icon className="w-6 h-6 text-blue-600" />
                                            <span className="font-medium text-gray-700">{page.name}</span>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-sm text-gray-500 space-y-2">
                    <p>Still can't find what you're looking for?</p>
                    <Link to={popularPages[3].href} className="text-blue-600 hover:underline font-medium">
                        Contact our support team
                    </Link>
                </div>
            </div>
        </div>
    )
}
