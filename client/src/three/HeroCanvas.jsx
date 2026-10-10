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
  const [telemetry, setTelemetry] = useState(null)
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
      onHoverChange: (info, clientX, clientY) => {
        if (info) {
          setTelemetry({ ...info, x: clientX, y: clientY })
          callbacksRef.current.onChipHover?.(true)
        } else {
          setTelemetry(null)
          callbacksRef.current.onChipHover?.(false)
        }
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
    >
      {/* Telemetry Tooltip when hovering over components */}
      {telemetry && (
        <div
          className="pcb-telemetry-tooltip glass-panel"
          style={{
            position: "fixed",
            left: Math.min(
              window.innerWidth - 280,
              Math.max(16, (telemetry.x || 100) + 16),
            ),
            top: Math.min(
              window.innerHeight - 140,
              Math.max(16, (telemetry.y || 100) - 10),
            ),
            zIndex: 100,
            pointerEvents: "none",
            padding: "0.65rem 0.95rem",
            background: "rgba(3, 7, 14, 0.92)",
            border: "1px solid rgba(0, 240, 255, 0.35)",
            borderRadius: "8px",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 240, 255, 0.2)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maxWidth: "280px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              fontFamily: "var(--display, 'AAVESH Display', sans-serif)",
              color: "#00f0ff",
              marginBottom: "0.25rem",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00f0ff",
                boxShadow: "0 0 8px #00f0ff",
                display: "inline-block",
              }}
            />
            <span>{telemetry.name}</span>
          </div>
          <p
            style={{
              fontSize: "0.7rem",
              color: "#cbd5e1",
              margin: "0 0 0.35rem 0",
              lineHeight: 1.35,
              fontFamily: "var(--body, 'Aavesh', sans-serif)",
            }}
          >
            {telemetry.desc}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.65rem",
              fontFamily: "var(--mono, 'Aavesh', monospace)",
              color: "#94a3b8",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "0.3rem",
            }}
          >
            <span>{telemetry.voltage || "3.3V"}</span>
            <span style={{ color: "#00f0ff" }}>{telemetry.freq || "ACTIVE"}</span>
          </div>
        </div>
      )}

      {/* Floating Interactive Badge (bottom-right of Hero 3D background) */}
      <div
        className="pcb-theme-badge"
        style={{
          position: "absolute",
          bottom: "1.2rem",
          right: "1.5rem",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          padding: "0.4rem 0.85rem",
          background: "rgba(2, 6, 12, 0.78)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "999px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          fontSize: "0.68rem",
          fontFamily: "var(--mono, 'Aavesh', monospace)",
          color: "#94a3b8",
          userSelect: "none",
          transition: "all 0.3s ease",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: `#${(activeTheme?.hex ?? 0x00f0ff).toString(16).padStart(6, "0")}`,
            boxShadow: `0 0 10px #${(activeTheme?.hex ?? 0x00f0ff).toString(16).padStart(6, "0")}`,
            display: "inline-block",
          }}
        />
        <span>
          RESONANCE:{" "}
          <strong
            style={{
              color: `#${(activeTheme?.hex ?? 0x00f0ff).toString(16).padStart(6, "0")}`,
              fontWeight: 600,
            }}
          >
            {activeTheme?.name || "AAVESH Cyan"}
          </strong>
        </span>
      </div>
    </div>
  )
}
