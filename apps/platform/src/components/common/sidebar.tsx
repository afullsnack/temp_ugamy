import { Play, X } from 'lucide-react'
import { Button } from '../ui/button'
import BrandLogo from './brand-logo'
import type { Dispatch, FC, SetStateAction } from 'react'
import ProfileImage from "@/public/profile-image.png"

interface IProps {
    sidebarOpen: boolean
    setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const Sidebar: FC<IProps> = ({ sidebarOpen, setSidebarOpen }) => {
    return (
        <div
            className={`
    fixed left-0 top-0 h-full w-80 bg-[hsla(221,39%,11%,1)] flex flex-col items-center z-50 text-white p-6 transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:z-auto overflow-y-auto
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
`}
        >
            {/* Mobile Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-slate-700 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            >
                <X className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <div className="w-[233px] h-[233px] flex items-center justify-center mb-[50px]">
                <BrandLogo />
            </div>

            {/* Profile Section */}
            <div className="flex-1">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-[233px] h-[233px] rounded-full overflow-hidden mb-4 bg-gray-600">
                        <img
                            src={ProfileImage}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Dominic Emeka</h2>
                </div>

                <div className="space-y-3 text-sm text-center mb-8">
                    <div>
                        <span className="text-gray-400">Username: </span>
                        <span className="text-teal-400">@gamer_don</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Email: </span>
                        <span className="text-teal-400">dom@ugamy.com</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Phone: </span>
                        <span className="text-teal-400">1234567890</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Join Date: </span>
                        <span className="text-teal-400">July 2025</span>
                    </div>
                </div>

                <Button className="w-full bg-[hsla(221,39%,11%,1)] hover:bg-[hsla(221,39%,11%,1)] text-[hsla(199,89%,48%,1)] font-bold mb-8 cursor-pointer">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Intro Video
                </Button>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-[50px] mt-auto">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 border-[hsla(160,84%,39%,1)] text-teal-400 hover:bg-[hsla(160,84%,39%,1)] hover:text-white bg-transparent"
                    >
                        Password Reset
                    </Button>
                </div>
                <Button variant="link" className="w-full text-[hsla(199,89%,48%,1)] hover:text-[hsla(199,89%,48%,1)]">
                    Logout
                </Button>
            </div>
        </div>
    )
}

export default Sidebar