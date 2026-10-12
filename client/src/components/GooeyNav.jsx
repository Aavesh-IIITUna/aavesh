import { useLayoutEffect, useRef, useState } from "react"
import "./GooeyNav.css"

const PARTICLE_COUNT = 18

export default function GooeyNav({ items, activeIndex = 0, onChange, className = "" }) {
  const rootRef = useRef(null)
  const itemRefs = useRef([])
  const previousIndex = useRef(activeIndex)
  const transitionTimers = useRef([])
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 })
  const [particles, setParticles] = useState([])

  const measure = (index) => {
    const root = rootRef.current
    const item = itemRefs.current[index]
    if (!root || !item) return null
    const rootRect = root.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    return {
      left: itemRect.left - rootRect.left,
      top: itemRect.top - rootRect.top,
      width: itemRect.width,
      height: itemRect.height,
      x: itemRect.left - rootRect.left + itemRect.width / 2,
      y: itemRect.top - rootRect.top + itemRect.height / 2,
    }
  }

  useLayoutEffect(() => {
    const target = measure(activeIndex)
    if (!target) return
    const source = measure(previousIndex.current)
    if (source && previousIndex.current !== activeIndex) {
      transitionTimers.current.forEach(window.clearTimeout)
      transitionTimers.current = []
      setPill({ left: source.left, width: source.width, opacity: 1 })
      const nextParticles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
        const angle = (Math.PI * 2 * index) / PARTICLE_COUNT + Math.random() * 0.5
        const scatter = 18 + Math.random() * 42
        return {
          id: `${activeIndex}-${index}-${Date.now()}`,
          sx: source.x + (Math.random() - 0.5) * source.width * 0.55,
          sy: source.y + (Math.random() - 0.5) * source.height * 0.38,
          mx: (source.x + target.x) / 2 + Math.cos(angle) * scatter,
          my: (source.y + target.y) / 2 + Math.sin(angle) * scatter,
          ex: target.x + (Math.random() - 0.5) * target.width * 0.48,
          ey: target.y + (Math.random() - 0.5) * target.height * 0.32,
          size: 5 + Math.random() * 11,
          delay: Math.random() * 130,
        }
      })
      setParticles(nextParticles)
      transitionTimers.current.push(
        window.setTimeout(() => setPill((current) => ({ ...current, opacity: 0 })), 70),
        window.setTimeout(() => setPill({ left: target.left, width: target.width, opacity: 0 }), 470),
        window.setTimeout(() => setPill({ left: target.left, width: target.width, opacity: 1 }), 650),
        window.setTimeout(() => setParticles([]), 780),
      )
    } else {
      setPill({ left: target.left, width: target.width, opacity: 1 })
    }
    previousIndex.current = activeIndex
  }, [activeIndex, items])

  useLayoutEffect(() => () => transitionTimers.current.forEach(window.clearTimeout), [])

  useLayoutEffect(() => {
    const refresh = () => {
      const target = measure(activeIndex)
      if (target) setPill({ left: target.left, width: target.width, opacity: 1 })
    }
    window.addEventListener("resize", refresh)
    return () => window.removeEventListener("resize", refresh)
  }, [activeIndex])

  return (
    <nav className={`gooey-nav gooey-nav--framed ${className}`.trim()} aria-label="Main Navigation" ref={rootRef}>
      <span className="gooey-nav__pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width, opacity: pill.opacity }} aria-hidden="true" />
      <span className="gooey-nav__particle-field" aria-hidden="true">
        {particles.map((particle) => <i key={particle.id} className="gooey-nav__particle" style={{
          "--sx": `${particle.sx}px`, "--sy": `${particle.sy}px`, "--mx": `${particle.mx}px`, "--my": `${particle.my}px`, "--ex": `${particle.ex}px`, "--ey": `${particle.ey}px`, "--size": `${particle.size}px`, "--delay": `${particle.delay}ms`,
        }} />)}
      </span>
      {items.map((item, index) => <button
        className={`gooey-nav__link ${index === activeIndex ? "is-active" : ""}`}
        key={item.href}
        ref={(element) => { itemRefs.current[index] = element }}
        type="button"
        onClick={() => onChange?.(index, item)}
        aria-current={index === activeIndex ? "page" : undefined}
      >{item.label}</button>)}
    </nav>
  )
}
