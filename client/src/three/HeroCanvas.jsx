import { useEffect, useRef, useState } from "react"
import { PCBSceneEngine, THEME_CONFIGS } from "./pcb-scene"

export default function HeroCanvas({
  autoRotate = true,
  powerSurge = false,
  burstRipple = 0,
  onChipClick,
  onChipHover,
  onThemeChange,
}) {
  const containerRef = useRef(null)
  const engineRef = useRef(null)
  const [activeTheme, setActiveTheme] = useState(THEME_CONFIGS[0])

  const callbacksRef = useRef({ onChipClick, onChipHover, onThemeChange })
  useEffect(() => {
    callbacksRef.current = { onChipClick, onChipHover, onThemeChange }
  })

  // Initialize 3D PCB Engine responsively across mobile, tablet, and desktop
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = new PCBSceneEngine(container, {
      autoRotate,
      onHoverChange: (info) => {
        callbacksRef.current.onChipHover?.(Boolean(info))
      },
      onThemeChange: (theme) => {
        setActiveTheme(theme)
        callbacksRef.current.onThemeChange?.(theme)
      },
      onChipClick: () => {
        callbacksRef.current.onChipClick?.()
      },
    })

    engineRef.current = engine

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose()
        engineRef.current = null
      }
    }
  }, [])

  // Sync autoRotate prop
  useEffect(() => {
    if (engineRef.current && engineRef.current.controls) {
      engineRef.current.options.autoRotate = autoRotate
    }
  }, [autoRotate])

  // Sync powerSurge / burst ripple
  useEffect(() => {
    if (burstRipple && engineRef.current) {
      engineRef.current.triggerBurstPulse()
    }
  }, [burstRipple, powerSurge])

  return (
    <div
      ref={containerRef}
      className="hero-canvas-container"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y",
        cursor: "grab",
      }}
    />
  )
}
