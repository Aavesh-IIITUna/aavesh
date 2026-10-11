import { useEffect, useRef, useState } from "react"
import "../styles/aavesh-cursor.css"

/**
 * AAVESH Custom Cursor System — Pixel-Accurate Reference Implementation
 * AAVESH Technical Society · IIIT Una
 *
 * Implements the 19 reference cursor states:
 * DEFAULT, HOVER, CLICK, TEXT, WAIT/LOADING, LINK, DRAG/MOVE,
 * RESIZE H, RESIZE V, RESIZE DIAG, HELP, NOT ALLOWED, PRECISION,
 * ALTERNATE, SCROLL, GRAB, GRABBING, SELECTION, DROP
 */

// Shared SVG Gradients & Filters
function CursorDefs() {
  return (
    <defs>
      {/* Primary Brand Gradient: Ice Cyan / Electric Blue -> Whitish Lavender -> Soft Whitish Purple */}
      <linearGradient id="aaveshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C4EEFF" />
        <stop offset="35%" stopColor="#85C0FF" />
        <stop offset="70%" stopColor="#DDD5FE" />
        <stop offset="100%" stopColor="#F3EEFE" />
      </linearGradient>

      {/* Whitish-Purple Accent Gradient (replaces harsh purple/pink) */}
      <linearGradient id="aaveshPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="40%" stopColor="#EBE4FF" />
        <stop offset="75%" stopColor="#DDD2FE" />
        <stop offset="100%" stopColor="#C8B8FF" />
      </linearGradient>

      {/* High-Energy Click Pulse Gradient: Pure White -> Luminous Whitish-Purple */}
      <linearGradient id="aaveshClickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="45%" stopColor="#F5F0FF" />
        <stop offset="100%" stopColor="#E4D8FF" />
      </linearGradient>

      {/* Cyan Glow Filter */}
      <filter id="aaveshBloom" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

// 1. DEFAULT / HOVER / CLICK Base Pointer
function PointerGeometry({ state = "default", isHover = false, isClick = false }) {
  const strokeColor = isClick ? "url(#aaveshClickGrad)" : "url(#aaveshGrad)"

  return (
    <svg
      className="aavesh-cursor-svg"
      width="34"
      height="38"
      viewBox="0 0 34 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />

      {/* Concentric Signal Rings for HOVER */}
      <circle
        className="aavesh-signal-ring-outer"
        cx="11.2"
        cy="12"
        r="17"
        stroke="url(#aaveshPinkGrad)"
        strokeWidth="0.65"
        strokeDasharray="none"
        fill="none"
      />
      <circle
        className="aavesh-signal-ring"
        cx="11.2"
        cy="12"
        r="13.2"
        stroke="url(#aaveshGrad)"
        strokeWidth="0.85"
        fill="none"
      />

      {/* Outer Pointer Chevron Body:
          Top Apex: (2, 2)
          Outer Right: (23.6, 20.8)
          Horizontal Bottom-Right: (14.2, 20.8)
          Inner Notch Chamfer: (13.0, 19.5)
          Inner Right: (3.8, 5.3)
      */}
      <path
        d="M 2 2 L 23.6 20.8 L 14.2 20.8 L 13.0 19.5 L 3.8 5.3"
        stroke={strokeColor}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Outer Wing:
          Top Apex: (2, 2)
          Bottom Apex: (5.3, 32.0)
          Bottom Inner Wing: (6.9, 28.9)
      */}
      <path
        d="M 2 2 L 5.3 32.0 L 6.9 28.9"
        stroke={strokeColor}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Internal Electronic Circuit Trace:
          Top vertical runner: (5.7, 8.7) -> (6.5, 14.2)
          45° jog to node: -> (10.2, 17.8)
      */}
      <path
        d="M 5.7 8.7 L 6.5 14.2 L 10.2 17.8"
        stroke={strokeColor}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Circular Electronic Node (Center-Bottom hollow ring):
          Center: (11.2, 18.9), Radius: 1.65
      */}
      <circle
        className="aavesh-circuit-node"
        cx="11.2"
        cy="18.9"
        r="1.65"
        stroke={strokeColor}
        strokeWidth="1.15"
        fill="#080D18"
      />

      {/* Circuit Lower Continuation to Left Wing:
          From node (11.2, 20.5) down-left to (7.5, 24.8) -> (6.9, 28.9)
      */}
      <path
        d="M 10.2 20.1 L 7.5 24.8 L 6.9 28.9"
        stroke={strokeColor}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal Node Detail (Subtle trace extension visible in HOVER state) */}
      {(isHover || state === "move") && (
        <g opacity={isHover ? "0.9" : "0.5"} className="aavesh-hover-trace">
          <path
            d="M 11.2 21 L 15.5 26.5 L 17.5 29.5"
            stroke="url(#aaveshPinkGrad)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <circle
            cx="17.5"
            cy="29.5"
            r="1.75"
            stroke="url(#aaveshGrad)"
            strokeWidth="1.1"
            fill="#080D18"
          />
        </g>
      )}
    </svg>
  )
}

// 2. TEXT (Electronic I-Beam)
function TextGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      {/* Top Crossbar with Serif Ticks */}
      <path
        d="M 6 5 L 18 5 M 6 5 L 6 7.5 M 18 5 L 18 7.5"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Vertical Spine */}
      <line
        x1="12"
        y1="5"
        x2="12"
        y2="23"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.4"
      />
      {/* Electronic Center Bracket Accent */}
      <path
        d="M 10 14 L 14 14"
        stroke="url(#aaveshPinkGrad)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Bottom Crossbar with Serif Ticks */}
      <path
        d="M 6 23 L 18 23 M 6 23 L 6 20.5 M 18 23 L 18 20.5"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 3. WAIT / LOADING (Precision Segmented Circular Spinner)
function WaitGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg aavesh-spinner-rotor"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      {/* Segment 1: Cyan Arc */}
      <path
        d="M 14 4 A 10 10 0 0 1 24 14"
        stroke="#9BDFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Segment 2: Violet Arc */}
      <path
        d="M 21.07 21.07 A 10 10 0 0 1 10 23.5"
        stroke="#B8A5FF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Segment 3: Restrained Pink Arc */}
      <path
        d="M 5.5 19 A 10 10 0 0 1 6.93 6.93"
        stroke="#F0A6DF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Center Micro Node */}
      <circle cx="14" cy="14" r="1.2" fill="#9BDFFF" />
    </svg>
  )
}

// 4. LINK (AAVESH Pointer + Interlocking Circuit Link Badge)
function LinkGeometry() {
  return (
    <div className="relative">
      <PointerGeometry state="link" isHover />
      {/* Interlocking Link Icon Badge at Bottom Right */}
      <svg
        className="absolute left-[18px] top-[18px]"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <CursorDefs />
        <rect
          x="1.8"
          y="7.2"
          width="7"
          height="4.2"
          rx="2.1"
          transform="rotate(-45 1.8 7.2)"
          stroke="url(#aaveshPinkGrad)"
          strokeWidth="1.2"
          fill="#080D18"
        />
        <rect
          x="6.4"
          y="11.8"
          width="7"
          height="4.2"
          rx="2.1"
          transform="rotate(-45 6.4 11.8)"
          stroke="url(#aaveshGrad)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </div>
  )
}

// 5. DRAG / MOVE (4-Way Precision Electronic Cross)
function DragGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      {/* Horizontal Axis */}
      <line x1="5" y1="16" x2="27" y2="16" stroke="url(#aaveshGrad)" strokeWidth="1.3" />
      {/* Vertical Axis */}
      <line x1="16" y1="5" x2="16" y2="27" stroke="url(#aaveshGrad)" strokeWidth="1.3" />
      {/* North Arrowhead */}
      <path d="M 12 9 L 16 4 L 20 9" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      {/* South Arrowhead */}
      <path d="M 12 23 L 16 28 L 20 23" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      {/* West Arrowhead */}
      <path d="M 9 12 L 4 16 L 9 20" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      {/* East Arrowhead */}
      <path d="M 23 12 L 28 16 L 23 20" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center Electronic Dot */}
      <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" stroke="url(#aaveshPinkGrad)" strokeWidth="0.8" />
    </svg>
  )
}

// 6. RESIZE HORIZONTAL (< - >)
function ResizeHGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="32"
      height="20"
      viewBox="0 0 32 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <line x1="6" y1="10" x2="26" y2="10" stroke="url(#aaveshGrad)" strokeWidth="1.3" />
      <path d="M 10 5 L 4 10 L 10 15" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 22 5 L 28 10 L 22 15" stroke="url(#aaveshPinkGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="10" r="1.3" fill="#9BDFFF" />
    </svg>
  )
}

// 7. RESIZE VERTICAL (^ | v)
function ResizeVGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="20"
      height="32"
      viewBox="0 0 20 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <line x1="10" y1="6" x2="10" y2="26" stroke="url(#aaveshGrad)" strokeWidth="1.3" />
      <path d="M 5 10 L 10 4 L 15 10" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 5 22 L 10 28 L 15 22" stroke="url(#aaveshPinkGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="16" r="1.3" fill="#9BDFFF" />
    </svg>
  )
}

// 8. RESIZE DIAGONAL (↖ ↘)
function ResizeDiagGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <line x1="6" y1="6" x2="22" y2="22" stroke="url(#aaveshGrad)" strokeWidth="1.3" />
      <path d="M 12 5 L 5 5 L 5 12" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 16 23 L 23 23 L 23 16" stroke="url(#aaveshPinkGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 9. HELP (Pointer + '?' Badge)
function HelpGeometry() {
  return (
    <div className="relative">
      <PointerGeometry state="help" />
      <svg
        className="absolute left-[19px] top-[15px]"
        width="16"
        height="18"
        viewBox="0 0 16 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <CursorDefs />
        <path
          d="M 3.5 5.5 C 3.5 3 5 1.5 7.5 1.5 C 10 1.5 11.5 3 11.5 5 C 11.5 7 9.5 8 8 9.5 L 8 11.5"
          stroke="url(#aaveshPinkGrad)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="8" cy="15" r="1.3" fill="#F0A6DF" />
      </svg>
    </div>
  )
}

// 10. NOT ALLOWED (Prohibition Ring with 45° Slash)
function NotAllowedGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <circle cx="13" cy="13" r="9.5" stroke="url(#aaveshPinkGrad)" strokeWidth="1.4" fill="#080D18" />
      <line x1="6.3" y1="6.3" x2="19.7" y2="19.7" stroke="url(#aaveshPinkGrad)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// 11. PRECISION (Target Reticle with Crosshairs)
function PrecisionGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <circle cx="14" cy="14" r="8" stroke="url(#aaveshGrad)" strokeWidth="1.2" fill="none" />
      <line x1="14" y1="2" x2="14" y2="8" stroke="url(#aaveshGrad)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="20" x2="14" y2="26" stroke="url(#aaveshPinkGrad)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="14" x2="8" y2="14" stroke="url(#aaveshGrad)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="14" x2="26" y2="14" stroke="url(#aaveshPinkGrad)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="14" cy="14" r="1.3" fill="#FFFFFF" />
    </svg>
  )
}

// 12. ALTERNATE (Swept-Wing Electronic Pointer)
function AlternateGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="32"
      height="36"
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <path
        d="M 2 2 L 25 18 L 15 18 L 13 21 L 12 24 L 5 32 Z"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="10" cy="16" r="1.3" stroke="url(#aaveshPinkGrad)" strokeWidth="1" fill="#080D18" />
    </svg>
  )
}

// 13. SCROLL (Up/Down Arrows with 3 Dotted Track Nodes)
function ScrollGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="20"
      height="32"
      viewBox="0 0 20 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <path d="M 6 8 L 10 3 L 14 8" stroke="url(#aaveshGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="12" r="1.2" fill="#9BDFFF" />
      <circle cx="10" cy="16" r="1.2" fill="#B8A5FF" />
      <circle cx="10" cy="20" r="1.2" fill="#F0A6DF" />
      <path d="M 6 24 L 10 29 L 14 24" stroke="url(#aaveshPinkGrad)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 14. GRAB (Open Hand Outline)
function GrabGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="26"
      height="28"
      viewBox="0 0 26 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <path
        d="M 6 12 C 6 10 8 10 8 12 L 8 16 M 8 9 C 8 7 10.5 7 10.5 9 L 10.5 15 M 10.5 8 C 10.5 6 13 6 13 8 L 13 15 M 13 9.5 C 13 7.8 15.5 7.8 15.5 9.5 L 15.5 17 C 15.5 22 13 25 8 25 C 5 25 3.5 23 3.5 20 L 3.5 15 C 3.5 13 5.5 13 5.5 15 L 6 16"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// 15. GRABBING (Closed Fist Outline)
function GrabbingGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="26"
      height="28"
      viewBox="0 0 26 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <path
        d="M 6 14 C 6 12 8 12 8 14 C 8 12 10.5 12 10.5 14 C 10.5 12 13 12 13 14 C 13 12 15.5 12 15.5 14 L 15.5 18 C 15.5 22 13 24 8 24 C 5 24 3.5 22 3.5 19 L 4 16 C 4 14 6 14 6 16"
        stroke="url(#aaveshPinkGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// 16. SELECTION (Technical Dashed Marquee Box)
function SelectionGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <rect
        className="aavesh-selection-box"
        x="4"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.3"
        strokeDasharray="3 3"
        fill="none"
      />
    </svg>
  )
}

// 17. DROP (Technical Folder + Plus Icon)
function DropGeometry() {
  return (
    <svg
      className="aavesh-cursor-svg"
      width="28"
      height="26"
      viewBox="0 0 28 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CursorDefs />
      <path
        d="M 3 6 C 3 4.8 4 4 5 4 L 10 4 L 13 7 L 23 7 C 24 7 25 7.8 25 9 L 25 21 C 25 22.2 24 23 23 23 L 5 23 C 4 23 3 22.2 3 21 Z"
        stroke="url(#aaveshGrad)"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="#080D18"
      />
      <line x1="14" y1="12" x2="14" y2="18" stroke="url(#aaveshPinkGrad)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11" y1="15" x2="17" y2="15" stroke="url(#aaveshPinkGrad)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Main AAVESH Cursor Component
 */
export default function AaveshCursor({ forceState = null }) {
  const [cursorState, setCursorState] = useState("default")
  const [isClicked, setIsClicked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState([])

  const containerRef = useRef(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const rippleIdRef = useRef(0)
  const isMouseDownRef = useRef(false)
  const isDraggingRef = useRef(false)
  const activeTargetRef = useRef(null)

  const activeState = forceState || cursorState
  const isArrowAlignment = [
    "default",
    "hover",
    "click",
    "link",
    "help",
    "move",
    "alternate",
  ].includes(activeState)

  useEffect(() => {
    // Check if device has fine pointer (mouse/trackpad), not touch/coarse
    const hasFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches
    if (!hasFinePointer) return

    // Hide native cursor only after initialization
    document.documentElement.classList.add("aavesh-cursor-active")

    let rafId = null

    // High performance RAF position sync
    const render = () => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`
      }
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    // State inspection helper
    const inspectTarget = (target) => {
      if (!target) return "default"

      // 0. If actively dragging with mouse held down, preserve grabbing
      if (isDraggingRef.current) {
        return "grabbing"
      }

      // 1. Explicit data-cursor attribute override
      const explicitCursor = target.closest("[data-cursor]")
      if (explicitCursor) {
        const val = explicitCursor.getAttribute("data-cursor")
        if (val) return val.toLowerCase()
      }

      // 2. Disabled controls -> not-allowed
      if (target.closest(":disabled, [aria-disabled='true']")) {
        return "not-allowed"
      }

      // 3. Grabbable containers (3D PCB canvas, infinite-menu, carousels)
      const grabTarget = target.closest(
        ".hero-canvas-container, [style*='cursor: grab'], [style*='cursor:grab'], [style*='grab'], .infinite-menu, .depth-carousel",
      )
      if (grabTarget) {
        return isMouseDownRef.current ? "grabbing" : "grab"
      }

      // 4. Computed style inspection
      const computed = window.getComputedStyle(target).cursor
      if (computed === "grab") return isMouseDownRef.current ? "grabbing" : "grab"
      if (computed === "grabbing") return "grabbing"
      if (computed === "text") return "text"
      if (computed === "not-allowed") return "not-allowed"
      if (computed === "help") return "help"
      if (computed === "crosshair") return "precision"
      if (computed === "move") return "drag"
      if (computed === "wait" || computed === "progress") return "wait"
      if (["ew-resize", "col-resize", "w-resize", "e-resize"].includes(computed)) return "resize-h"
      if (["ns-resize", "row-resize", "n-resize", "s-resize"].includes(computed)) return "resize-v"
      if (["nwse-resize", "nesw-resize"].includes(computed)) return "resize-diag"

      // 5. Form inputs and textareas -> text
      if (target.closest("input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']")) {
        return "text"
      }

      // 6. Links and Navigation -> link
      if (target.closest("a, [role='link']")) {
        return "link"
      }

      // 7. Interactive buttons and cards -> hover
      if (target.closest("button, [role='button'], summary, .domain-card, .project-card, .event-feature, [data-interactive]")) {
        return "hover"
      }

      return "default"
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      activeTargetRef.current = e.target

      if (!isVisible) setIsVisible(true)

      if (isDraggingRef.current && isMouseDownRef.current) {
        setCursorState("grabbing")
        return
      }

      const nextState = inspectTarget(e.target)
      setCursorState(nextState)
    }

    const handleMouseDown = (e) => {
      isMouseDownRef.current = true
      setIsClicked(true)

      const isGrab = e.target.closest(
        ".hero-canvas-container, [style*='cursor: grab'], [style*='cursor:grab'], [style*='grab'], .infinite-menu, .depth-carousel",
      ) || (window.getComputedStyle(e.target).cursor === "grab") || (window.getComputedStyle(e.target).cursor === "grabbing")

      if (isGrab) {
        isDraggingRef.current = true
        setCursorState("grabbing")
      } else {
        const nextState = inspectTarget(e.target)
        setCursorState(nextState)
      }

      // Emit electronic click pulse ripple
      const newRipple = {
        id: ++rippleIdRef.current,
        x: e.clientX,
        y: e.clientY,
      }
      setRipples((prev) => [...prev.slice(-3), newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 500)
    }

    const handleMouseUp = (e) => {
      isMouseDownRef.current = false
      setIsClicked(false)
      isDraggingRef.current = false

      const nextState = inspectTarget(e.target)
      setCursorState(nextState)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
      document.documentElement.classList.add("aavesh-cursor-active")
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      document.documentElement.classList.remove("aavesh-cursor-active")
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.documentElement.classList.remove("aavesh-cursor-active")
    }
  }, [isVisible])

  // Map state to corresponding SVG geometry
  const renderGeometry = () => {
    switch (activeState) {
      case "hover":
        return <PointerGeometry state="hover" isHover isClick={isClicked} />
      case "click":
        return <PointerGeometry state="click" isClick />
      case "text":
        return <TextGeometry />
      case "wait":
      case "loading":
        return <WaitGeometry />
      case "link":
        return <LinkGeometry />
      case "drag":
      case "move":
        return <DragGeometry />
      case "resize-h":
        return <ResizeHGeometry />
      case "resize-v":
        return <ResizeVGeometry />
      case "resize-diag":
        return <ResizeDiagGeometry />
      case "help":
        return <HelpGeometry />
      case "not-allowed":
        return <NotAllowedGeometry />
      case "precision":
        return <PrecisionGeometry />
      case "alternate":
        return <AlternateGeometry />
      case "scroll":
        return <ScrollGeometry />
      case "grab":
        return <GrabGeometry />
      case "grabbing":
        return <GrabbingGeometry />
      case "selection":
        return <SelectionGeometry />
      case "drop":
        return <DropGeometry />
      case "default":
      default:
        return <PointerGeometry state="default" isClick={isClicked} />
    }
  }

  return (
    <>
      {/* Root Cursor Viewport */}
      <div
        ref={containerRef}
        className={`aavesh-cursor-container ${isVisible ? "is-visible" : ""} ${
          isClicked ? "is-clicked" : ""
        } state-${activeState}`}
        aria-hidden="true"
      >
        <div
          className={`aavesh-cursor-hotspot ${
            isArrowAlignment ? "align-arrow" : "align-center"
          }`}
        >
          {renderGeometry()}
        </div>
      </div>

      {/* Electronic Click Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="aavesh-click-ripple"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

export { AaveshCursor }
