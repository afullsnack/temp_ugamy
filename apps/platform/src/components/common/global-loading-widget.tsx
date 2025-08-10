"use client"

import { Gamepad2 } from "lucide-react"
import BrandLogo from "./brand-logo"

export default function GlobalLoadingWidget() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="mb-[40px]">
        <BrandLogo />
      </div>
      {/* Emerald aurora + vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 30%, rgba(16,185,129,0.16), transparent 60%), radial-gradient(800px 600px at 50% 75%, rgba(16,185,129,0.10), transparent 60%)",
        }}
      />
      {/* Subtle grid (white) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen"
        style={{
          background:
            "linear-gradient(transparent 95%, rgba(255,255,255,0.3) 96%), linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.3) 96%)",
          backgroundSize: "32px 32px, 32px 32px",
        }}
      />
      {/* Scanlines (white) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 3px)",
          animation: "scan 6s linear infinite",
        }}
      />

      {/* Loader */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Neon rotating rings */}
        <div className="relative size-28 sm:size-32">
          {/* Base ring */}
          <div className="absolute inset-0 rounded-full border border-white/10" />
          {/* Outer arc (emerald) */}
          <div
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-r-transparent"
            style={{
              borderTopColor: "#10B981",
              animation: "spin-slow 1200ms linear infinite",
            }}
          />
          {/* Inner arc (emerald) */}
          <div
            className="absolute inset-3 rounded-full border-b-2 border-l-2 border-l-transparent"
            style={{
              borderBottomColor: "rgba(16,185,129,0.85)",
              animation: "spin-reverse 1800ms linear infinite",
            }}
          />

          {/* Center icon + emerald glow */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.4), rgba(255,255,255,0.08), transparent 70%)",
                  filter: "saturate(140%)",
                }}
              />
              <Gamepad2 className="size-8 sm:size-9" style={{ color: "#10B981" }} />
            </div>
          </div>
        </div>

        {/* Simple label (Arial, no shadows) */}
        <div className="text-sm tracking-[0.2em] uppercase text-white/90">Loading</div>

        {/* Indeterminate progress bar (emerald -> white) */}
        <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #10B981, #ffffff)",
              width: "40%",
              animation: "progress 1400ms ease-in-out infinite",
              boxShadow: "0 0 16px rgba(16,185,129,0.6)",
            }}
          />
        </div>
      </div>

      {/* Keyframes + reduced motion */}
      <style>{`
        @keyframes spin-slow {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes progress {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(10%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        @keyframes scan {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [role='status'] * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}
