import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CircuitBoard,
  Cpu,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import BrandMark from "../components/BrandMark"
import SloshGauge from "../components/SloshGauge"

const TOTAL_FRAMES = 101 // frame_000.webp to frame_100.webp

function getFramePath(index) {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index))
  const padded = String(clamped).padStart(3, "0")
  return `/energy-frames/frame_${padded}.webp`
}

const domainsData = [
  {
    code: "HW.01",
    copy: "High-speed circuit design, multilayer PCB development, and signal integrity.",
    icon: CircuitBoard,
    title: "Electronics",
  },
  {
    code: "EM.02",
    copy: "Bare-metal firmware, RTOS, sensor telemetry, and low-power hardware.",
    icon: Cpu,
    title: "Embedded Systems",
  },
  {
    code: "RB.03",
    copy: "Autonomous rovers, kinematic motion systems, and distributed IoT.",
    icon: Bot,
    title: "Robotics & IoT",
  },
  {
    code: "AI.04",
    copy: "On-device edge inference, real-time computer vision, and neural models.",
    icon: BrainCircuit,
    title: "AI & Intelligence",
  },
]

const sponsorTiers = [
  "Hardware Lab Partner",
  "Component & Chip Grants",
  "Hackathon Title Patron",
  "Mentorship & Technical Fellowships",
]

function interpolateRgb(hex1, hex2, factor) {
  const c1 = [
    parseInt(hex1.slice(1, 3), 16),
    parseInt(hex1.slice(3, 5), 16),
    parseInt(hex1.slice(5, 7), 16),
  ]
  const c2 = [
    parseInt(hex2.slice(1, 3), 16),
    parseInt(hex2.slice(3, 5), 16),
    parseInt(hex2.slice(5, 7), 16),
  ]
  const t = Math.max(0, Math.min(1, factor))
  const r = Math.round(c1[0] + t * (c2[0] - c1[0]))
  const g = Math.round(c1[1] + t * (c2[1] - c1[1]))
  const b = Math.round(c1[2] + t * (c2[2] - c1[2]))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

/**
 * 3 distinct colors for the three sections only:
 * 1st section (About): Blue (#0077ff)
 * 2nd section (Domains): White (#f5f5f5)
 * 3rd section (Sponsors): Orange (#ea580c)
 */
function getLiquidColor(stage) {
  if (stage === 0) return "#0077ff" // 1st: Blue
  if (stage === 1) return "#f5f5f5" // 2nd: White
  return "#ea580c" // 3rd: Orange
}

export default function ScrollShowcase() {
  const trackRef = useRef(null)
  const canvasRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [level, setLevel] = useState(0)
  const [activeStage, setActiveStage] = useState(0)

  // Animation and frame management refs
  const imagesRef = useRef([])
  const loadedCountRef = useRef(0)
  const currentFrameRef = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef(null)
  const staticBaseFrameRef = useRef(0)
  const staticStartTimeRef = useRef(0)
  const rafIdRef = useRef(null)

  // Preload frames progressively
  useEffect(() => {
    const images = new Array(TOTAL_FRAMES)
    imagesRef.current = images

    // Load initial frame immediately
    const img0 = new Image()
    img0.src = getFramePath(0)
    img0.onload = () => {
      images[0] = img0
      loadedCountRef.current += 1
      drawFrame(0)
    }

    // Load remaining frames in small batches
    let currentBatch = 1
    const loadNextBatch = () => {
      const batchSize = 12
      const end = Math.min(TOTAL_FRAMES, currentBatch + batchSize)
      for (let i = currentBatch; i < end; i += 1) {
        const img = new Image()
        img.src = getFramePath(i)
        img.onload = () => {
          images[i] = img
          loadedCountRef.current += 1
        }
      }
      currentBatch = end
      if (currentBatch < TOTAL_FRAMES) {
        setTimeout(loadNextBatch, 35)
      }
    }

    const timer = setTimeout(loadNextBatch, 40)
    return () => clearTimeout(timer)
  }, [])

  // Draw frame to canvas with aspect-ratio preserving math
  const drawFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const images = imagesRef.current
      let targetImg = images[frameIndex]

      if (!targetImg || !targetImg.complete) {
        for (let d = 1; d <= 25; d += 1) {
          if (images[frameIndex - d]?.complete) {
            targetImg = images[frameIndex - d]
            break
          }
          if (images[frameIndex + d]?.complete) {
            targetImg = images[frameIndex + d]
            break
          }
        }
      }

      if (!targetImg || !targetImg.complete) return

      const { height: cHeight, width: cWidth } = canvas
      const imgWidth = targetImg.naturalWidth || targetImg.width
      const imgHeight = targetImg.naturalHeight || targetImg.height

      if (!imgWidth || !imgHeight) return

      const scale = Math.max(cWidth / imgWidth, cHeight / imgHeight)
      const drawWidth = imgWidth * scale
      const drawHeight = imgHeight * scale
      const drawX = (cWidth - drawWidth) / 2
      const drawY = (cHeight - drawHeight) / 2

      ctx.clearRect(0, 0, cWidth, cHeight)
      ctx.drawImage(targetImg, drawX, drawY, drawWidth, drawHeight)
    },
    [],
  )

  // Resize canvas according to device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.imageSmoothingEnabled = true
      drawFrame(Math.round(currentFrameRef.current))
    }

    handleResize()
    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [drawFrame])

  // Track scroll progress and manage discrete stage switching
  useEffect(() => {
    const handleScroll = () => {
      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const totalScrollable = rect.height - window.innerHeight
      if (totalScrollable <= 0) return

      const rawProgress = -rect.top / totalScrollable
      const progress = Math.max(0, Math.min(1, rawProgress))

      setScrollProgress(progress)
      setLevel(Math.round(progress * 100))

      // Discrete stage threshold marks
      let stage = 0
      if (progress >= 0.65) {
        stage = 2 // Stage 3: Sponsors
      } else if (progress >= 0.32) {
        stage = 1 // Stage 2: Technical Domains
      } else {
        stage = 0 // Stage 1: About
      }
      setActiveStage(stage)

      isScrollingRef.current = true
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false
        staticBaseFrameRef.current = currentFrameRef.current
        staticStartTimeRef.current = performance.now()
      }, 160)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  // Continuous animation loop for smooth frame sequence interpolation
  useEffect(() => {
    const loop = (now) => {
      rafIdRef.current = requestAnimationFrame(loop)

      if (isScrollingRef.current) {
        const targetFrame = scrollProgress * (TOTAL_FRAMES - 1)
        currentFrameRef.current +=
          (targetFrame - currentFrameRef.current) * 0.2
        staticBaseFrameRef.current = currentFrameRef.current
        staticStartTimeRef.current = now
      } else {
        // When not scrolling, keep frames strictly still
        currentFrameRef.current +=
          (staticBaseFrameRef.current - currentFrameRef.current) * 0.12
      }

      const frameToDraw = Math.round(
        Math.max(0, Math.min(TOTAL_FRAMES - 1, currentFrameRef.current)),
      )
      drawFrame(frameToDraw)
    }

    rafIdRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [drawFrame, scrollProgress])

  // Scroll jump helper
  const scrollToStage = (stageIndex) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const scrollTop = window.scrollY + rect.top
    const total = track.offsetHeight - window.innerHeight

    let targetPct = 0.08
    if (stageIndex === 1) targetPct = 0.48
    if (stageIndex === 2) targetPct = 0.88

    window.scrollTo({
      behavior: "smooth",
      top: scrollTop + total * targetPct,
    })
  }

  // Interactive gauge change handler
  const handleGaugeChange = (newLevel) => {
    setLevel(newLevel)
    const track = trackRef.current
    if (track) {
      const rect = track.getBoundingClientRect()
      const totalScrollable = track.offsetHeight - window.innerHeight
      if (totalScrollable > 0) {
        const scrollTop = window.scrollY + rect.top
        window.scrollTo({
          behavior: "smooth",
          top: scrollTop + (newLevel / 100) * totalScrollable,
        })
      }
    }
  }

  const liquidColor = getLiquidColor(activeStage)

  return (
    <section className="showcase-track scrollbar-none" id="showcase" ref={trackRef}>
      <div className="showcase-sticky scrollbar-none">
        {/* Dynamic Energy Currents Canvas Background Texture */}
        <div className="showcase-canvas-container">
          <canvas className="showcase-canvas" ref={canvasRef} />
          <div className="showcase-overlay" />
          <div className="showcase-grid-lines" />
        </div>

        {/* Content Layout: Transitioning left-to-right, emerging from the central SloshGauge */}
        <div className="showcase-stage-layout scrollbar-none">
          {/* STAGE 1: ABOUT (Emerge to the left of the SloshGauge) */}
          <div
            className={`showcase-stage-card showcase-stage-card--about ${
              activeStage === 0 ? "is-active" : "is-inactive"
            }`}
          >
            <div className="showcase-glass-panel showcase-glass-panel--blue">
              <div className="section-label">
                <span>02</span>
                <span className="section-label__line" />
                <span>About AAVESH</span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <BrandMark className="h-6 w-auto md:h-7 inline-block align-middle" />
                <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white m-0">
                  AAVESH
                </h2>
              </div>

              <p className="text-[#0077ff] font-mono text-xs uppercase tracking-wider mb-2 font-semibold">
                Electronics &amp; Technology Society · IIIT Una
              </p>

              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                A student-driven technical society dedicated to hands-on
                engineering, hardware innovation, and collaborative building. We
                bridge the boundary between silicon architecture, intelligent
                systems, and embedded firmware.
              </p>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-400 block font-mono">
                    Institutional Home
                  </span>
                  <strong className="text-white">
                    Indian Institute of Information Technology Una
                  </strong>
                </div>
              </div>

              <button
                className="button button--text inline-flex items-center gap-2 text-xs font-mono"
                onClick={() => scrollToStage(1)}
                type="button"
              >
                <span>Scroll down or jump to domains</span>
                <ArrowRight aria-hidden="true" size={14} />
              </button>
            </div>
          </div>

          {/* CENTRAL ANCHOR: SLOSHGAUGE WITH FLUID PHYSICS */}
          <div className="showcase-gauge-center">
            <SloshGauge
              ariaLabel="Volume"
              className="showcase-slosh-gauge"
              glassColor="#27272a"
              height={180}
              interactive
              liquidColor={liquidColor}
              onChange={handleGaugeChange}
              radius={20}
              showValue
              splash={0.42}
              ticks={4}
              tilt={0.45}
              unit="%"
              value={level}
              viscosity={0.15}
              width={88}
            />
          </div>

          {/* STAGE 2: TECHNICAL DOMAINS (Emerge to the right of the SloshGauge) */}
          <div
            className={`showcase-stage-card showcase-stage-card--domains ${
              activeStage === 1 ? "is-active" : "is-inactive"
            }`}
          >
            <div className="showcase-glass-panel showcase-glass-panel--white">
              <div className="section-label">
                <span>03</span>
                <span className="section-label__line" />
                <span>Technical Domains</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white my-2">
                Built Across The Stack.
              </h2>

              <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-3">
                Hardware is where ideas meet reality. Software gives them
                behavior. AAVESH operates at the active intersection.
              </p>

              {/* Interactive domain cards */}
              <div className="showcase-domains-grid">
                {domainsData.map((domain) => {
                  const Icon = domain.icon
                  return (
                    <div className="showcase-domain-item" key={domain.title}>
                      <div className="showcase-domain-header">
                        <Icon aria-hidden="true" size={18} />
                        <span className="showcase-domain-code">
                          {domain.code}
                        </span>
                      </div>
                      <h3 className="showcase-domain-title">{domain.title}</h3>
                      <p className="showcase-domain-desc">{domain.copy}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  className="button button--text inline-flex items-center gap-2 text-xs font-mono"
                  onClick={() => scrollToStage(2)}
                  type="button"
                >
                  <span>Continue to sponsors</span>
                  <ArrowRight aria-hidden="true" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* STAGE 3: SPONSORS (LEFT CARD) */}
          <div
            className={`showcase-stage-card showcase-stage-card--sponsors-left ${
              activeStage === 2 ? "is-active" : "is-inactive"
            }`}
          >
            <div className="showcase-glass-panel showcase-glass-panel--orange">
              <div className="section-label">
                <span>08</span>
                <span className="section-label__line" />
                <span>Sponsors &amp; Partnerships</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white my-2">
                Build The Next Thing{" "}
                <span className="text-[#ea580c]">With Us.</span>
              </h2>

              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Partnerships empower student builders with state-of-the-art
                tools, component fabrication, compute access, and direct
                industry mentorship. Join us in shaping tomorrow&apos;s
                engineers.
              </p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 shadow-[0_0_8px_#f97316]" />
                Official corporate partnerships &amp; lab grants welcome for
                the upcoming academic year.
              </div>
            </div>
          </div>

          {/* STAGE 3: SPONSORS (RIGHT CARD) */}
          <div
            className={`showcase-stage-card showcase-stage-card--sponsors-right ${
              activeStage === 2 ? "is-active" : "is-inactive"
            }`}
          >
            <div className="showcase-glass-panel showcase-glass-panel--orange">
              <div className="section-label">
                <span>OPPORTUNITIES</span>
                <span className="section-label__line" />
                <span>Active Tiers</span>
              </div>

              <div className="showcase-sponsor-tiers">
                {sponsorTiers.map((tier) => (
                  <span className="showcase-tier-pill" key={tier}>
                    {tier}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-start gap-3">
                <a className="button button--primary" href="#contact">
                  <span>Discuss a partnership</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Small Devices Thin Sidebar Progress Indicator */}
        <aside
          className="showcase-mobile-sidebar"
          aria-label="Section progress"
        >
          <div className="showcase-mobile-sidebar-track">
            <div
              className="showcase-mobile-sidebar-fill"
              style={{
                height: `${Math.max(4, Math.min(100, level))}%`,
                backgroundColor: liquidColor,
                boxShadow: `0 0 10px ${liquidColor}`,
              }}
            />
          </div>
          <span
            className="showcase-mobile-sidebar-val"
            style={{ color: liquidColor }}
          >
            {Math.round(level)}%
          </span>
        </aside>
      </div>
    </section>
  )
}
