"use client";

import BrandLogo from './brand-logo'

const VideoWatermark = () => {
    return (
        <div className='w-full h-full'>
            {/* Left water mark */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-24 left-3 z-30"
            >
                <div className="w-fit h-fit flex flex-col items-start px-2.5 py-1 rounded-md">
                    <BrandLogo className='opacity-35' />
                    <span className="text-[10px] md:text-xs font-medium tracking-wide text-white/90 opacity-35">
                        © Ugamy {new Date().getFullYear()}
                    </span>
                </div>
            </div>

            {/* Right water mark */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute bottom-24 right-3 z-30"
            >
                <div className="w-fit h-fit flex flex-col items-start px-2.5 py-1 rounded-md">
                    <BrandLogo className='opacity-35' />
                    <span className="text-[10px] md:text-xs font-medium tracking-wide text-white/90 opacity-35">
                        © Ugamy {new Date().getFullYear()}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default VideoWatermark