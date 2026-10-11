import { ArrowRight, RotateCcw } from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import "../styles/mobile-hero.css"

export default function MobileHero({
  headline = "IDEAS BUILT DIFFERENTLY",
  subtitle = "Electronics, AI/ML, IoT and robotics. A student technical community of builders, designers, and systems architects at IIIT Una.",
  primaryBtnText = "OUR WORK",
  primaryBtnUrl = "#showcase",
}) {
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const orbARef = useRef(null)
  const orbBRef = useRef(null)
  const animsRef = useRef([])
  const timerRef = useRef(null)
  const lastCharRef = useRef(null)

  // Configuration for accent shape position
  const blobWord = 1 // After "BUILT" (0 = IDEAS, 1 = BUILT, 2 = DIFFERENTLY)
  const blobAfter = 5 // After 5th character 'T' in BUILT
  const SCATTER_EVERY = 9 // seconds between scatter-and-reassemble
  const RIPPLE_EVERY = 3.2 // seconds between colour ripples

  const words = headline.trim().split(" ")

  useEffect(() => {
    const root = rootRef.current
    const title = titleRef.current
    const sub = subRef.current
    const cta = ctaRef.current
    const orbA = orbARef.current
    const orbB = orbBRef.current
    if (!title || !sub || !cta) return

    const wordsEls = title.querySelectorAll(".mobile-hero-word")
    const chars = title.querySelectorAll(".mobile-hero-char")
    const blob = title.querySelector(".mobile-hero-blob")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const track = (a) => {
      animsRef.current.push(a)
      return a
    }

    const killAll = () => {
      animsRef.current.forEach((a) => {
        if (a && typeof a.kill === "function") a.kill()
      })
      animsRef.current = []
      if (timerRef.current && typeof timerRef.current.kill === "function") {
        timerRef.current.kill()
        timerRef.current = null
      }
      gsap.set([chars, wordsEls, blob, sub, cta, orbA, orbB], { clearProps: "all" })
    }

    const spreadX = () => Math.min(window.innerWidth, 600) * 0.6
    const spreadY = () => Math.min(window.innerHeight, 600) * 0.4

    const scatterIn = (dur, partial = false) => {
      const k = partial ? 0.5 : 1
      return gsap.from(chars, {
        x: () => gsap.utils.random(-spreadX(), spreadX()) * k,
        y: () => gsap.utils.random(-spreadY(), spreadY()) * k,
        rotation: () => gsap.utils.random(-120, 120) * k,
        scale: 0,
        opacity: 0,
        duration: dur,
        ease: "back.out(1.6)",
        stagger: { each: 0.045, from: "random" },
      })
    }

    const ripple = () => {
      const t = gsap.timeline()
      const accent = "#00e5ff"
      const fg = "#f8fafc"
      t.to(chars, {
        scale: 1.22,
        y: -10,
        color: accent,
        duration: 0.28,
        ease: "power2.out",
        stagger: { each: 0.06 },
      }).to(
        chars,
        {
          scale: 1,
          y: 0,
          color: fg,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          stagger: { each: 0.06 },
        },
        0.28,
      )
      return t
    }

    const reScatter = () => {
      const t = gsap.timeline()
      t.to(chars, {
        x: () => gsap.utils.random(-spreadX(), spreadX()) * 0.5,
        y: () => gsap.utils.random(-spreadY(), spreadY()) * 0.5,
        rotation: () => gsap.utils.random(-90, 90),
        scale: 0.4,
        opacity: 0.2,
        duration: 0.7,
        ease: "power2.in",
        stagger: { each: 0.025, from: "random" },
      }).to(chars, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 1.1,
        ease: "back.out(1.6)",
        stagger: { each: 0.04, from: "random" },
      })
      return t
    }

    const idle = () => {
      // Continuous micro-motion: words drift gently
      wordsEls.forEach((w, i) => {
        track(
          gsap.to(w, {
            y: gsap.utils.random(-7, -4),
            rotation: gsap.utils.random(-1.6, 1.6),
            duration: gsap.utils.random(1.6, 2.4),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: i * 0.3,
          }),
        )
      })

      // Accent shape squash, stretch & bounce
      if (blob) {
        track(
          gsap.to(blob, {
            scaleX: 1.3,
            scaleY: 0.75,
            yoyo: true,
            repeat: -1,
            duration: 0.45,
            ease: "sine.inOut",
          }),
        )
        track(
          gsap.to(blob, {
            y: -14,
            rotation: 12,
            yoyo: true,
            repeat: -1,
            duration: 0.9,
            ease: "power1.inOut",
          }),
        )
      }

      // Background ambient orbs wandering
      if (orbA) {
        track(
          gsap.to(orbA, {
            x: "12vw",
            y: "10vh",
            duration: 9,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          }),
        )
      }
      if (orbB) {
        track(
          gsap.to(orbB, {
            x: "-14vw",
            y: "-8vh",
            duration: 11,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          }),
        )
      }

      // Timed loop: periodic ripple with occasional full re-scatter
      let n = 0
      const loop = () => {
        n++
        const every = Math.max(1, Math.round(SCATTER_EVERY / RIPPLE_EVERY))
        const run = n % every === 0 ? reScatter() : ripple()
        track(run)
        timerRef.current = gsap.delayedCall(RIPPLE_EVERY + run.duration(), loop)
      }
      timerRef.current = gsap.delayedCall(RIPPLE_EVERY, loop)
    }

    const play = () => {
      killAll()
      if (reduce) {
        gsap.set([chars, wordsEls, blob, sub, cta, orbA, orbB], { clearProps: "all" })
        return
      }

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: idle,
      })
      intro.add(scatterIn(1.2))

      if (blob) {
        intro.from(
          blob,
          { scale: 0, rotation: -180, duration: 0.9, ease: "elastic.out(1, 0.5)" },
          0.6,
        )
      }

      intro
        .from(sub, { y: 24, opacity: 0, duration: 0.8 }, "-=0.7")
        .from(cta, { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")

      track(intro)
    }

    // Touch / Pointer hop interaction
    const hop = (e) => {
      if (reduce) return
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || !el.classList.contains("mobile-hero-char") || el === lastCharRef.current) {
        return
      }
      lastCharRef.current = el
      gsap.fromTo(
        el,
        { y: 0 },
        {
          y: -18,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
          overwrite: "auto",
        },
      )
    }

    const clearLast = () => {
      lastCharRef.current = null
    }

    title.addEventListener("pointerdown", hop)
    title.addEventListener("pointermove", hop)
    title.addEventListener("pointerup", clearLast)
    title.addEventListener("pointerleave", clearLast)

    // Visibility management
    const handleVisibility = () => {
      gsap.globalTimeline.paused(document.hidden)
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // Handle replay button click
    const replayBtn = document.getElementById("mobile-hero-replay")
    if (replayBtn) {
      replayBtn.addEventListener("click", play)
    }

    gsap.ticker.lagSmoothing(500, 33)
    play()

    return () => {
      killAll()
      title.removeEventListener("pointerdown", hop)
      title.removeEventListener("pointermove", hop)
      title.removeEventListener("pointerup", clearLast)
      title.removeEventListener("pointerleave", clearLast)
      document.removeEventListener("visibilitychange", handleVisibility)
      if (replayBtn) {
        replayBtn.removeEventListener("click", play)
      }
    }
  }, [headline])

  return (
    <section aria-labelledby="mobile-hero-title" className="mobile-hero-root" ref={rootRef}>
      {/* Dynamic drifting background orbs */}
      <div aria-hidden="true" className="mobile-hero-orb orb-a" ref={orbARef} />
      <div aria-hidden="true" className="mobile-hero-orb orb-b" ref={orbBRef} />

      {/* Cyber Grid Overlay */}
      <div aria-hidden="true" className="mobile-hero-grid" />

      <main className="mobile-hero-main">
        {/* Eyebrow badge */}
        <div className="mobile-hero-eyebrow">
          <span className="mobile-hero-dot" />
          <span>01 // AAVESH // IIIT UNA</span>
        </div>

        {/* Headline with word and character spans */}
        <h1
          aria-label={headline}
          className="mobile-hero-title"
          id="mobile-hero-title"
          ref={titleRef}
        >
          {words.map((word, wIdx) => {
            const isAccent = word === "DIFFERENTLY"
            const chars = word.split("")

            return (
              <span
                aria-hidden="true"
                className={`mobile-hero-word ${isAccent ? "mobile-hero-word--accent" : ""}`}
                key={`${word}-${wIdx}`}
              >
                {chars.map((char, cIdx) => (
                  <span className="mobile-hero-char-wrap" key={`${char}-${cIdx}`}>
                    <span className="mobile-hero-char">{char}</span>
                    {wIdx === blobWord && cIdx === blobAfter - 1 && (
                      <span className="mobile-hero-blob" />
                    )}
                  </span>
                ))}
              </span>
            )
          })}
        </h1>

        {/* Subtitle */}
        <p className="mobile-hero-sub" id="mobile-hero-sub" ref={subRef}>
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mobile-hero-cta" id="mobile-hero-cta" ref={ctaRef}>
          <a className="mobile-hero-btn-primary" href={primaryBtnUrl}>
            <span>{primaryBtnText}</span>
            <ArrowRight aria-hidden="true" size={15} />
          </a>
          <button
            aria-label="Replay hero text animation"
            className="mobile-hero-btn-replay"
            id="mobile-hero-replay"
            type="button"
          >
            <RotateCcw aria-hidden="true" size={14} />
            <span>Replay</span>
          </button>
        </div>
      </main>
    </section>
  )
}
