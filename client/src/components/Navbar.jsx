import { Menu, X } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import BrandMark from "./BrandMark"
import GooeyNav from "./GooeyNav"

const navLinks = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Gallery", href: "#gallery" },
  { label: "Team", href: "#team" },
  { label: "Sponsors", href: "#sponsors" },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState("top")
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  })
  const navLinksRef = useRef([])
  const isClickScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef(null)

  // Track active section and header scrolled styling dynamically
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        ticking = false
        const scrollY = window.scrollY
        setScrolled(scrollY > 20)

        const windowHeight = window.innerHeight
        const docHeight = document.documentElement.scrollHeight

        // Edge case: Top of the page
        if (scrollY < 120) {
          setActiveId("top")
          return
        }

        // The About section is a tall sticky scroll showcase. Activate it as
        // soon as the showcase enters the viewport, then retain it throughout
        // the entire sticky track.
        const aboutSection = document.getElementById("about")
        if (aboutSection) {
          const aboutRect = aboutSection.getBoundingClientRect()
          const navbarHeight = 76
          if (aboutRect.top <= window.innerHeight - navbarHeight && aboutRect.bottom > navbarHeight) {
            setActiveId("about")
            return
          }
        }

        // Edge case: Near bottom of the page
        if (scrollY + windowHeight >= docHeight - 70) {
          setActiveId("contact")
          return
        }

        // Target trigger line at 32% viewport height for natural reading position
        const targetLine = scrollY + windowHeight * 0.32
        const sectionIds = [...navLinks.map((l) => l.href.replace("#", "")), "contact"]

        let matched = "top"
        for (let i = 0; i < sectionIds.length; i++) {
          const id = sectionIds[i]
          const el = document.getElementById(id)
          if (el) {
            const rect = el.getBoundingClientRect()
            const elementTop = rect.top + scrollY
            const elementBottom = elementTop + rect.height

            if (targetLine >= elementTop && targetLine < elementBottom) {
              matched = id
              break
            } else if (elementTop <= targetLine) {
              matched = id
            }
          }
        }

        setActiveId(matched)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Update sliding pill indicator position whenever activeId changes
  useLayoutEffect(() => {
    const activeIndex = navLinks.findIndex(
      (l) => l.href.replace("#", "") === activeId,
    )
    if (activeIndex >= 0 && navLinksRef.current[activeIndex]) {
      const el = navLinksRef.current[activeIndex]
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      })
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
    }
  }, [activeId])

  // Recalculate indicator position on window resize
  useEffect(() => {
    const handleResize = () => {
      const activeIndex = navLinks.findIndex(
        (l) => l.href.replace("#", "") === activeId,
      )
      if (activeIndex >= 0 && navLinksRef.current[activeIndex]) {
        const el = navLinksRef.current[activeIndex]
        setIndicatorStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        })
      }
    }
    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [activeId])

  // Smooth scroll handler with offset for fixed header
  const scrollToSection = (e, href) => {
    e.preventDefault()
    const id = href.replace("#", "")
    setActiveId(id)
    setMenuOpen(false)

    isClickScrollingRef.current = true
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false
    }, 800)

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const el = document.getElementById(id)
    if (el) {
      const headerOffset = 76
      const elTop =
        el.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top: Math.max(0, elTop), behavior: "smooth" })
    }
  }

  const activeNavIndex = navLinks.findIndex((link) => link.href === `#${activeId}`)

  // Close mobile drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  return (
    <header
      className={`navbar-root ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "is-menu-open" : ""}`}
      id="site-navbar"
    >
      <div className="navbar-container">
        {/* Brand / Logo */}
        <a
          aria-label="AAVESH homepage"
          className="navbar-brand"
          href="#top"
          onClick={(e) => scrollToSection(e, "#top")}
        >
          <div className="navbar-brand-icon">
            <BrandMark className="h-8 w-auto md:h-9" />
          </div>
        </a>

        {/* Desktop Navigation Links with Hardware-Accelerated Sliding Indicator */}
        <GooeyNav
          className="navbar-links"
          items={navLinks}
          activeIndex={activeNavIndex === -1 ? navLinks.length - 1 : activeNavIndex}
          onChange={(_, item) => scrollToSection({ preventDefault() {} }, item.href)}
        />

        {/* Right CTA & Mobile Toggle */}
        <div className="navbar-actions">
          <a
            className={`navbar-contact-btn ${activeId === "contact" ? "is-active" : ""}`}
            href="#contact"
            onClick={(e) => scrollToSection(e, "#contact")}
          >
            <span>Contact</span>
          </a>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="navbar-toggle-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            type="button"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        aria-hidden={!menuOpen}
        className={`navbar-mobile-drawer ${menuOpen ? "is-active" : ""}`}
      >
        <div className="navbar-mobile-inner">
          <nav aria-label="Mobile Navigation" className="navbar-mobile-links">
            {navLinks.map(({ label, href }) => {
              const id = href.replace("#", "")
              const isActive = activeId === id
              return (
                <a
                  className={`navbar-mobile-link ${isActive ? "is-active" : ""}`}
                  href={href}
                  key={href}
                  onClick={(e) => scrollToSection(e, href)}
                >
                  <span>{label}</span>
                  {isActive && <span className="navbar-mobile-dot" />}
                </a>
              )
            })}
            <a
              className={`navbar-mobile-link navbar-mobile-contact ${activeId === "contact" ? "is-active" : ""}`}
              href="#contact"
              onClick={(e) => scrollToSection(e, "#contact")}
            >
              <span>Contact</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
