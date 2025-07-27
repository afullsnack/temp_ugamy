"use client"

import BrandLogo from "../common/brand-logo"
// import WelcomeImage from "@/public/ugamy-welcome-image.png"

export default function WelcomeScreen() {
    return (
        <div className="hidden md:block relative h-full bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 overflow-hidden">
            {/* Main Content */}
            <div className="relative z-10 h-full flex flex-col items-start justify-center gap-y-[191px] text-center p-[45px]">
                {/* Logo */}
                <BrandLogo />

                {/* Main Content */}
                <div className="bg-[hsla(221,39%,11%,0.5)] max-w-[574px] min-h-[447px] h-fit md:py-[91px] md:px-10 rounded-[30px]">
                    {/* Main Heading */}
                    <h2 className="max-w-[494px] text-4xl md:text-5xl font-bold text-white text-left leading-[60px] mb-6">
                        New Here? Welcome to Ugamy.
                    </h2>

                    {/* Description */}
                    <p className="max-w-[494px] text-base md:text-lg text-[#E5E7EB] text-left leading-[30px] mx-auto mb-[50px]">
                        Unlock your Gaming potential with the only platform built to help you play smarter, win faster, and rise
                        through the ranks; one episode at a time.
                    </p>

                    {/* Quote */}
                    <div className="pt-8">
                        <p className="text-xl text-[hsla(199,89%,48%,1)] text-left font-normal italic">"Don't just play, master it."</p>
                    </div>
                </div>
            </div>
            {/* Background Image */}
            <img src="/ugamy-welcome-image.png?url." alt="welcome image" className="absolute inset-0 w-full h-full" />
        </div>
    )
}
