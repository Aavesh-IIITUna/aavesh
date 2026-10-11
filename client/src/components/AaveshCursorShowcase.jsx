import React, { useState } from "react"
import "./AaveshCursorShowcase.css"

/**
 * AaveshCursorShowcase:
 * Interactive Reference Visualizer matching the official AAVESH CURSOR SET specification board.
 * Allows instant live testing of all 19 cursor interaction states.
 */

const CURSOR_STATES = [
  // Row 1
  { id: "default", label: "DEFAULT", description: "Primary angular AAVESH pointer with internal circuit node" },
  { id: "hover", label: "HOVER", description: "Concentric signal ring fading in around the pointer" },
  { id: "click", label: "CLICK", description: "High-energy restrained magenta/pink pulse" },
  { id: "text", label: "TEXT", description: "Precision electronic I-beam for text selection" },
  { id: "wait", label: "WAIT/LOADING", description: "3-arc segmented tech spinner rotating continuously" },
  { id: "link", label: "LINK", description: "AAVESH pointer with interlocking circuit chain link" },
  { id: "drag", label: "DRAG", description: "4-way diamond arrowhead electronic directional cross" },
  { id: "resize-h", label: "RESIZE H", description: "Horizontal bidirectional arrow < - >" },
  { id: "resize-v", label: "RESIZE V", description: "Vertical bidirectional arrow ^ | v" },
  { id: "resize-diag", label: "RESIZE DIAG", description: "45-degree diagonal bidirectional arrow" },

  // Row 2
  { id: "help", label: "HELP", description: "AAVESH pointer with glowing technical question mark" },
  { id: "not-allowed", label: "NOT ALLOWED", description: "Electronic prohibition ring with 45° diagonal slash" },
  { id: "precision", label: "PRECISION", description: "Target reticle with crosshair ticks and central dot" },
  { id: "alternate", label: "ALTERNATE", description: "Swept-back alternative electronic pointer" },
  { id: "scroll", label: "SCROLL", description: "Vertical scroll indicator with dotted telemetry track" },
  { id: "grab", label: "GRAB", description: "Stylized geometric open hand for canvas dragging" },
  { id: "grabbing", label: "GRABBING", description: "Stylized geometric closed fist for active drag interaction" },
  { id: "selection", label: "SELECTION", description: "Dashed technical bounding marquee box" },
  { id: "drop", label: "DROP", description: "Precision technical folder with plus cross icon" },
]

export default function AaveshCursorShowcase() {
  const [activeTestState, setActiveTestState] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="aavesh-showcase-section" id="cursor-system">
      <div className="container mx-auto px-4 py-16">
        {/* Header telemetry badge */}
        <div className="flex items-center justify-between mb-8 border-b border-[#68A9FF]/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#080D18] border border-[#68A9FF]/30 text-xs font-mono text-[#9BDFFF] tracking-wider uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#68A9FF] animate-pulse" />
              SYSTEM COMPONENT · REF-SPEC v1.0
            </div>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-widest text-white">
              AAVESH <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9BDFFF] via-[#B8A5FF] to-[#F0A6DF]">CURSOR SET</span>
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mt-1">
              A minimal, custom cursor set designed for the AAVESH website — inspired by electronics, circuitry, and precision.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400">
              19 STATES · 0-LAG RAF · PRECISION HOTSPOT
            </span>
          </div>
        </div>

        {/* Master Showcase Layout matching Reference Image */}
        <div className="showcase-board-card relative rounded-2xl p-6 md:p-10 border border-[#68A9FF]/25 bg-[#080D18]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Subtle PCB Background Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(#68A9FF_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Upper Section: Reference Hero Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12 relative z-10">
            {/* Left Title & Description */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1">
                <div className="text-2xl font-black tracking-widest text-white flex items-center gap-2">
                  <span className="text-[#9BDFFF]">/\</span>
                  <span className="text-[#68A9FF]">/\</span>
                  <span className="text-[#B8A5FF]">V</span>
                  <span className="text-[#F0A6DF]">ESH</span>
                </div>
                <div className="text-xs font-mono tracking-[0.3em] text-[#9BDFFF] uppercase">
                  CURSOR SET
                </div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#68A9FF] to-[#F0A6DF] mt-1" />
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                A sharp, geometric triangular arrow silhouette inspired by the AAVESH logo.
                Engineered with hollow outlined construction, electric-blue to pink gradient illumination,
                internal circuit node, and concentric signal telemetry.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-700/60">HOTSPOT: TIP (0,0)</span>
                <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-700/60">VECTOR: INLINE SVG</span>
                <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-700/60">RAF RENDER</span>
              </div>
            </div>

            {/* Center: Large Drafting Centerpiece */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div
                className="relative w-64 h-64 flex items-center justify-center cursor-pointer group"
                data-cursor="hover"
                title="Hover to test live hover ring"
              >
                {/* Circular Drafting Reticle */}
                <div className="absolute inset-0 rounded-full border border-[#68A9FF]/20" />
                <div className="absolute inset-4 rounded-full border border-[#68A9FF]/10 border-dashed" />
                <div className="absolute w-full h-[1px] bg-[#68A9FF]/15" />
                <div className="absolute h-full w-[1px] bg-[#68A9FF]/15" />

                {/* SVG Pointer Scaled Preview */}
                <svg
                  className="w-36 h-36 drop-shadow-[0_0_12px_rgba(104,169,255,0.5)] drop-shadow-[0_0_24px_rgba(240,166,223,0.35)] transition-transform duration-300 group-hover:scale-105"
                  viewBox="0 0 34 38"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="showcaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9BDFFF" />
                      <stop offset="30%" stopColor="#68A9FF" />
                      <stop offset="68%" stopColor="#B8A5FF" />
                      <stop offset="100%" stopColor="#F0A6DF" />
                    </linearGradient>
                  </defs>

                  {/* Drafting circle */}
                  <circle cx="11.2" cy="12" r="16" stroke="rgba(104,169,255,0.25)" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Outer Pointer Body */}
                  <path
                    d="M 2 2 L 23.6 20.8 L 14.2 20.8 L 13.0 19.5 L 3.8 5.3"
                    stroke="url(#showcaseGrad)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Left Wing */}
                  <path
                    d="M 2 2 L 5.3 32.0 L 6.9 28.9"
                    stroke="url(#showcaseGrad)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Internal Circuit Jog */}
                  <path
                    d="M 5.7 8.7 L 6.5 14.2 L 10.2 17.8"
                    stroke="url(#showcaseGrad)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Circular Electronic Node */}
                  <circle cx="11.2" cy="18.9" r="1.8" stroke="url(#showcaseGrad)" strokeWidth="1.3" fill="#080D18" />
                  {/* Lower Connection */}
                  <path
                    d="M 10.2 20.1 L 7.5 24.8 L 6.9 28.9"
                    stroke="url(#showcaseGrad)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="absolute bottom-1 text-[10px] font-mono text-[#9BDFFF]/70 uppercase tracking-widest">
                  GEOMETRIC SILHOUETTE
                </span>
              </div>
            </div>

            {/* Right: MOVE and HOVER Preview Cards */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              {/* MOVE Card */}
              <div
                className="interactive-pad p-4 rounded-xl border border-[#68A9FF]/20 bg-[#0c1322]/80 flex flex-col items-center justify-center transition-all hover:border-[#68A9FF]/60 hover:bg-[#111a30]"
                data-cursor="move"
                title="Hover to activate MOVE cursor state"
              >
                <div className="h-20 flex items-center justify-center">
                  <svg className="w-16 h-16 drop-shadow-[0_0_8px_rgba(104,169,255,0.4)]" viewBox="0 0 34 38" fill="none">
                    <defs>
                      <linearGradient id="moveCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9BDFFF" />
                        <stop offset="100%" stopColor="#F0A6DF" />
                      </linearGradient>
                    </defs>
                    <path d="M 2 2 L 23.6 20.8 L 14.2 20.8 L 13.0 19.5 L 3.8 5.3" stroke="url(#moveCardGrad)" strokeWidth="1.35" />
                    <path d="M 2 2 L 5.3 32.0 L 6.9 28.9" stroke="url(#moveCardGrad)" strokeWidth="1.35" />
                    <path d="M 5.7 8.7 L 6.5 14.2 L 10.2 17.8" stroke="url(#moveCardGrad)" strokeWidth="1.1" />
                    <circle cx="11.2" cy="18.9" r="1.65" stroke="url(#moveCardGrad)" strokeWidth="1.15" fill="#080D18" />
                    <path d="M 10.2 20.1 L 7.5 24.8 L 6.9 28.9" stroke="url(#moveCardGrad)" strokeWidth="1.1" />
                    {/* Extended Move Vector Line */}
                    <path d="M 11.2 21 L 18 28 L 24 33" stroke="#B8A5FF" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="24" cy="33" r="1.5" fill="#F0A6DF" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-mono uppercase tracking-widest text-[#9BDFFF]">
                  M O V E
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Test hover pad</span>
              </div>

              {/* HOVER Card */}
              <div
                className="interactive-pad p-4 rounded-xl border border-[#68A9FF]/20 bg-[#0c1322]/80 flex flex-col items-center justify-center transition-all hover:border-[#F0A6DF]/60 hover:bg-[#111a30]"
                data-cursor="hover"
                title="Hover to activate HOVER cursor state"
              >
                <div className="h-20 flex items-center justify-center">
                  <svg className="w-16 h-16 drop-shadow-[0_0_8px_rgba(240,166,223,0.4)]" viewBox="0 0 34 38" fill="none">
                    <defs>
                      <linearGradient id="hoverCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9BDFFF" />
                        <stop offset="100%" stopColor="#F0A6DF" />
                      </linearGradient>
                    </defs>
                    <circle cx="11.2" cy="12" r="15" stroke="#F0A6DF" strokeWidth="0.8" opacity="0.6" />
                    <circle cx="11.2" cy="12" r="11" stroke="#68A9FF" strokeWidth="1" opacity="0.8" />
                    <path d="M 2 2 L 23.6 20.8 L 14.2 20.8 L 13.0 19.5 L 3.8 5.3" stroke="url(#hoverCardGrad)" strokeWidth="1.35" />
                    <path d="M 2 2 L 5.3 32.0 L 6.9 28.9" stroke="url(#hoverCardGrad)" strokeWidth="1.35" />
                    <path d="M 5.7 8.7 L 6.5 14.2 L 10.2 17.8" stroke="url(#hoverCardGrad)" strokeWidth="1.1" />
                    <circle cx="11.2" cy="18.9" r="1.65" stroke="url(#hoverCardGrad)" strokeWidth="1.15" fill="#080D18" />
                    <path d="M 10.2 20.1 L 7.5 24.8 L 6.9 28.9" stroke="url(#hoverCardGrad)" strokeWidth="1.1" />
                    <path d="M 11.2 21 L 15.5 26.5 L 17.5 29.5" stroke="#F0A6DF" strokeWidth="0.9" />
                    <circle cx="17.5" cy="29.5" r="1.75" stroke="#9BDFFF" strokeWidth="1.1" fill="#080D18" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-mono uppercase tracking-widest text-[#F0A6DF]">
                  H O V E R
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Signal ring pad</span>
              </div>
            </div>
          </div>

          {/* Lower Section: Full 19-State Interactive Grid */}
          <div className="relative z-10 pt-6 border-t border-[#68A9FF]/20">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#9BDFFF]">
                INTERACTIVE STATE MATRIX (HOVER EACH CARD TO TRIGGER LIVE POINTER)
              </span>
              <span className="text-xs font-mono text-slate-400">
                19 CALIBRATED MODES
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {CURSOR_STATES.map((item) => (
                <div
                  key={item.id}
                  data-cursor={item.id}
                  className="interactive-pad p-3 rounded-lg border border-[#68A9FF]/15 bg-[#091020]/90 hover:border-[#68A9FF]/60 hover:bg-[#121c35] transition-all flex flex-col items-center justify-between text-center min-h-[92px] group"
                  title={item.description}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs font-mono text-[#9BDFFF] group-hover:scale-110 transition-transform">
                      {item.id === "default" && "▲"}
                      {item.id === "hover" && "◎"}
                      {item.id === "click" && "⚡"}
                      {item.id === "text" && "I"}
                      {item.id === "wait" && "◌"}
                      {item.id === "link" && "🔗"}
                      {item.id === "drag" && "✢"}
                      {item.id === "resize-h" && "↔"}
                      {item.id === "resize-v" && "↕"}
                      {item.id === "resize-diag" && "⤡"}
                      {item.id === "help" && "?"}
                      {item.id === "not-allowed" && "⊘"}
                      {item.id === "precision" && "⌖"}
                      {item.id === "alternate" && "◸"}
                      {item.id === "scroll" && "⇅"}
                      {item.id === "grab" && "✋"}
                      {item.id === "grabbing" && "✊"}
                      {item.id === "selection" && "▢"}
                      {item.id === "drop" && "📁"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-300 group-hover:text-white uppercase mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive Functional Test Strip */}
            <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 uppercase">Test interactive elements:</span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md bg-[#68A9FF]/20 border border-[#68A9FF]/50 text-xs font-mono text-[#9BDFFF] hover:bg-[#68A9FF]/30 transition-colors"
                  data-cursor="hover"
                >
                  Button (Hover)
                </button>
                <a
                  href="#cursor-system"
                  className="px-3 py-1.5 rounded-md bg-[#F0A6DF]/20 border border-[#F0A6DF]/50 text-xs font-mono text-[#F0A6DF] hover:bg-[#F0A6DF]/30 transition-colors"
                  data-cursor="link"
                >
                  Anchor (Link)
                </a>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-sm">
                <input
                  type="text"
                  placeholder="Test text selection & typing..."
                  defaultValue="AAVESH · Electronics Society IIIT Una"
                  className="w-full px-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#9BDFFF]"
                  data-cursor="text"
                />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400 select-none cursor-grab active:cursor-grabbing"
                  data-cursor="grab"
                >
                  Drag Canvas (Grab / Grabbing)
                </div>
                <div
                  className="px-3 py-1.5 rounded-md bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 select-none cursor-not-allowed"
                  data-cursor="not-allowed"
                >
                  Disabled
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
