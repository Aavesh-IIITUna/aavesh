import CinematicIntro from "./components/CinematicIntro"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import TechCursor from "./components/TechCursor"
import ScrollHUD from "./components/ScrollHUD"

/**
 * DefaultLayout component for AAVESH
 * Defines the canonical responsive layout shell for all pages across mobile, tablet, and desktop.
 * Wraps pages with CinematicIntro, Skip Link, Navbar, Main Content Container, Footer,
 * TechCursor, and ScrollHUD.
 */
export default function DefaultLayout({
  children,
  society,
  reverseFlow = false,
  onToggleReverseFlow,
  onReplayIntro,
  forceIntro = false,
  onIntroComplete,
  introKey = 0,
  showIntro = true,
  showCursor = true,
  showHUD = true,
  className = "",
}) {
  return (
    <div
      className={`app-wrapper min-h-screen flex flex-col justify-between selection:bg-[#00f0ff]/20 selection:text-[#00f0ff] ${
        reverseFlow ? "is-polarity-reversed" : ""
      } ${className}`}
    >
      {/* Cinematic Audio-Visual Intro Sequence */}
      {showIntro && (
        <CinematicIntro
          key={introKey}
          forcePlay={forceIntro}
          onComplete={onIntroComplete || (() => {})}
        />
      )}

      {/* Accessibility Skip Link */}
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Global Responsive Navigation Header */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full" id="main">
        {children}
      </main>

      {/* Global Site Footer */}
      <Footer onReplayIntro={onReplayIntro} society={society} />

      {/* Interactive Tech Cursor (auto-hidden on touch/mobile screens) */}
      {showCursor && <TechCursor />}

      {/* Fixed Scroll Telemetry HUD */}
      {showHUD && (
        <ScrollHUD
          onToggleReverseFlow={onToggleReverseFlow}
          reverseFlow={reverseFlow}
        />
      )}
    </div>
  )
}

export { DefaultLayout, DefaultLayout as Layout }
