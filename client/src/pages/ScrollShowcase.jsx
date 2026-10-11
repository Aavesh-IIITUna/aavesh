import { useCallback, useEffect, useRef, useState } from "react"
import SloshGauge from "../components/SloshGauge"
import { showcaseStages } from "../data/siteData"

const TOTAL_FRAMES = 101
const framePath = (index) => `/energy-frames/frame_${String(Math.max(0, Math.min(TOTAL_FRAMES - 1, index))).padStart(3, "0")}.webp`

function StagePanel({ stage, active, onAdvance }) {
  const side = stage.placement === "right" ? "right" : "left"
  return (
    <article className={`showcase-stage-card showcase-stage-card--${side} ${active ? "is-active" : "is-inactive"}`}>
      <div className={`showcase-glass-panel showcase-glass-panel--${stage.panel}`}>
        <div className="section-label"><span>{stage.number}</span><span className="section-label__line" /><span>{stage.eyebrow}</span></div>
        <h2 className="showcase-stage-title">{stage.title}</h2>
        <p className="showcase-stage-copy">{stage.body}</p>
        {onAdvance && <button className="showcase-advance" onClick={onAdvance} type="button">NEXT SECTION <span aria-hidden="true">→</span></button>}
      </div>
    </article>
  )
}

export default function ScrollShowcase() {
  const trackRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const frameRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const stageCount = showcaseStages.length
  const activeStage = Math.min(stageCount - 1, Math.floor(progress * stageCount))
  const active = showcaseStages[activeStage]

  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current
    const image = imagesRef.current[index]
    if (!canvas || !image?.complete) return
    const context = canvas.getContext("2d")
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
  }, [])

  useEffect(() => {
    imagesRef.current = Array.from({ length: TOTAL_FRAMES }, (_, index) => {
      const image = new Image()
      image.src = framePath(index)
      image.onload = () => drawFrame(Math.round(frameRef.current))
      return image
    })
  }, [drawFrame])

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      drawFrame(Math.round(frameRef.current))
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })
    return () => window.removeEventListener("resize", resize)
  }, [drawFrame])

  useEffect(() => {
    const update = () => {
      const track = trackRef.current
      if (!track) return
      const available = track.offsetHeight - window.innerHeight
      const next = available > 0 ? Math.max(0, Math.min(1, -track.getBoundingClientRect().top / available)) : 0
      frameRef.current = next * (TOTAL_FRAMES - 1)
      drawFrame(Math.round(frameRef.current))
      setProgress(next)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [drawFrame])

  const scrollToStage = (index) => {
    const track = trackRef.current
    if (!track) return
    const available = track.offsetHeight - window.innerHeight
    window.scrollTo({ top: window.scrollY + track.getBoundingClientRect().top + available * ((index + 0.15) / stageCount), behavior: "smooth" })
  }

  return <section className="showcase-track scrollbar-none" id="about" ref={trackRef} style={{ height: `${stageCount * 100 + 40}vh` }}>
    <div className="showcase-sticky scrollbar-none">
      <div className="showcase-canvas-container"><canvas className="showcase-canvas" ref={canvasRef} /><div className="showcase-overlay" /><div className="showcase-grid-lines" /></div>
      <div className="showcase-stage-layout scrollbar-none">
        {showcaseStages.map((stage, index) => <StagePanel key={stage.id} stage={stage} active={activeStage === index} onAdvance={index < stageCount - 1 ? () => scrollToStage(index + 1) : null} />)}
        <div className="showcase-gauge-center"><SloshGauge ariaLabel="Showcase progress" className="showcase-slosh-gauge" glassColor="#27272a" height={180} interactive liquidColor={active.accent} onChange={(value) => window.scrollTo({ top: window.scrollY + trackRef.current.getBoundingClientRect().top + (trackRef.current.offsetHeight - window.innerHeight) * (value / 100), behavior: "smooth" })} radius={20} showValue splash={0.42} ticks={4} tilt={0.45} unit="%" value={Math.round(progress * 100)} viscosity={0.15} width={88} /></div>
      </div>
      <aside className="showcase-mobile-sidebar" aria-label="Section progress"><div className="showcase-mobile-sidebar-track"><div className="showcase-mobile-sidebar-fill" style={{ height: `${Math.max(4, progress * 100)}%`, backgroundColor: active.accent, boxShadow: `0 0 10px ${active.accent}` }} /></div><span className="showcase-mobile-sidebar-val" style={{ color: active.accent }}>{String(activeStage + 1).padStart(2, "0")} / {String(stageCount).padStart(2, "0")}</span></aside>
    </div>
  </section>
}
