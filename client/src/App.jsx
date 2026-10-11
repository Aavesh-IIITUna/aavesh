import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowRight,
  Bot,
  CalendarDays,
  ChevronRight,
  CircuitBoard,
  Code2,
  Cpu,
  Mail,
  MapPin,
  Radio,
  Send,
  Users,
} from "lucide-react"
import { useEffect, useLayoutEffect, useState } from "react"
import BrandMark from "./components/BrandMark"
import DefaultLayout from "./layout"
import DepthCarousel from "./components/DepthCarousel"
import InfiniteMenu from "./components/InfiniteMenu"
import { useSociety } from "./hooks/useSociety"
import { api, ApiRequestError } from "./lib/api"
import Hero from "./pages/Hero"
import ScrollShowcase from "./pages/ScrollShowcase"

gsap.registerPlugin(ScrollTrigger)

function Link({ children, className = "", href, label, onClick }) {
  return (
    <a aria-label={label} className={className} href={href} onClick={onClick}>
      {children}
    </a>
  )
}

function ButtonLink({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  return (
    <Link className={`button button--${variant} ${className}`} {...props}>
      {children}
    </Link>
  )
}

function Heading({ as: Tag = "h2", children, className = "", id }) {
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  )
}

function SectionLabel({ index, children }) {
  return (
    <div className="section-label">
      <span>{index}</span>
      <span className="section-label__line" />
      <span>{children}</span>
    </div>
  )
}

function SectionIntro({ index, label, title, description, action }) {
  return (
    <div className="section-intro" data-reveal>
      <SectionLabel index={index}>{label}</SectionLabel>
      <Heading className="section-title">{title}</Heading>
      <p className="section-description">{description}</p>
      {action ? (
        <ButtonLink href={action.href} variant="text">
          {action.label}
          <ArrowRight aria-hidden="true" size={16} />
        </ButtonLink>
      ) : null}
    </div>
  )
}

function ContentBadge({ children, variant = "default" }) {
  return <span className={`content-badge ${variant === "live" ? "border-[#00f0ff] text-[#00f0ff]" : ""}`}>{children}</span>
}

function ImageWithCredit({ alt, className = "", credit, src }) {
  return (
    <figure className={`image-frame ${className}`}>
      <img alt={alt} loading="lazy" src={src} />
      <figcaption>{credit}</figcaption>
    </figure>
  )
}


const fallbackDomainIcons = {
  "01": CircuitBoard,
  "02": Cpu,
  "03": Radio,
  "04": Bot,
}

const defaultDomains = [
  {
    icon: CircuitBoard,
    title: "VLSI & Microelectronics",
    copy: "ASIC flow, RTL synthesis, tapeouts, and physical circuit fundamentals that turn silicon concepts into working hardware.",
    code: "HW.01",
  },
  {
    icon: Cpu,
    title: "Embedded Systems & IoT",
    copy: "Microcontrollers, RTOS firmware, sensor nodes, and low-power connected edge hardware for real-world telemetry.",
    code: "EM.02",
  },
  {
    icon: Radio,
    title: "Signal Processing & RF Systems",
    copy: "SDR transceiver design, DSP algorithms, antenna arrays, and high-frequency communication protocols.",
    code: "RF.03",
  },
  {
    icon: Bot,
    title: "Robotics & Autonomous Nodes",
    copy: "Integrated mechanical, motor control, LiDAR slam, and intelligent computer vision for autonomous navigation.",
    code: "RB.04",
  },
]

const gallery = [
  {
    alt: "Close-up of hands working on an electronic circuit board",
    credit: "Illustrative image · Minh Đức / Unsplash",
    image: "/images/soldering.jpg",
    label: "Build",
    title: "Hands-on electronics",
  },
  {
    alt: "A robot prototype being reviewed by people",
    credit: "Illustrative image · C.F. Photography / Unsplash",
    image: "/images/robotics.jpg",
    label: "Test",
    title: "Robotics in motion",
  },
  {
    alt: "Engineering students collaborating in a workshop",
    credit: "Illustrative image · ThisisEngineering / Unsplash",
    image: "/images/workshop.jpg",
    label: "Learn",
    title: "Collaborative workshops",
  },
  {
    alt: "Detailed dark-blue circuit board",
    credit: "Illustrative image · Vishnu Mohanan / Unsplash",
    image: "/images/circuit-board.jpg",
    label: "Explore",
    title: "Inside the hardware",
  },
]

function About({ society }) {
  return (
    <section aria-labelledby="about-title" className="section" id="about">
      <div className="container about-grid">
        <div className="about-copy" data-reveal>
          <SectionLabel index="02">About</SectionLabel>
          <span className="eyebrow">We are</span>
          <Heading className="about-title" id="about-title">
            <BrandMark className="h-7 w-auto md:h-9 inline-block align-middle mr-2" />
            {society?.shortName || "AAVESH"}
          </Heading>
          <p className="about-lead">
            {society?.tagline || "Electronics & Technology Society at IIIT Una."}
          </p>
          <p className="section-description">
            {society?.mission ||
              "A student technical community for learning through building. AAVESH brings together electronics, software, and intelligent systems through projects, workshops, competitions, and peer collaboration."}
          </p>
          <ButtonLink href="#domains" variant="text">
            Explore our technical tracks
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>

        <div className="about-media" data-reveal>
          <ImageWithCredit
            alt="Detailed dark-blue circuit board"
            credit="Electronics Laboratory · IIIT Una"
            src="/images/circuit-board.jpg"
          />
          <div className="about-note">
            <span className="status-dot" />
            <div>
              <span className="eyebrow">Institutional home</span>
              <strong>{society?.institute || "Indian Institute of Information Technology Una"}</strong>
              <p>{society?.metrics?.facility ? `${society.metrics.facility}, Himachal Pradesh` : "Himachal Pradesh, India"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Domains({ tracks }) {
  const displayDomains = (tracks && tracks.length > 0)
    ? tracks.map((track, i) => {
        const codeNum = track.code || String(i + 1).padStart(2, "0")
        const Icon = fallbackDomainIcons[codeNum] || (i === 0 ? CircuitBoard : i === 1 ? Cpu : i === 2 ? Radio : Bot)
        return {
          code: `TRK.${codeNum}`,
          title: track.title,
          copy: track.description || defaultDomains[i % defaultDomains.length].copy,
          icon: Icon,
        }
      })
    : defaultDomains

  return (
    <section
      aria-labelledby="domains-title"
      className="section section--ruled"
      id="domains"
    >
      <div className="container">
        <div className="section-heading-row">
          <SectionIntro
            description="Four lanes from atoms to autonomy—pairing first principles with bench time, tapeouts, and field deployments."
            index="03"
            label="Technical Tracks"
            title={
              <>
                Built across
                <br />
                the silicon stack.
              </>
            }
          />
          <p className="section-kicker" data-reveal>
            Hardware is where ideas meet physical reality. Signal processing gives them life.
            AAVESH operates at the frontier of edge computing.
          </p>
        </div>

        <div className="domain-grid">
          {displayDomains.map(({ code, copy, icon: Icon, title }) => (
            <article className="domain-card" data-reveal key={title}>
              <div className="domain-card__top">
                <Icon aria-hidden="true" />
                <span>{code}</span>
              </div>
              <div>
                <Heading as="h3">{title}</Heading>
                <p>{copy}</p>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="card-arrow"
                size={18}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Projects({ projects, live }) {
  const projectImages = [
    "/images/circuit-board.jpg",
    "/images/soldering.jpg",
    "/images/robotics.jpg",
  ]

  return (
    <section
      aria-labelledby="projects-title"
      className="section section--ruled"
      id="projects"
    >
      <div className="container split-section">
        <SectionIntro
          description="Hardware initiatives built on testbenches, taped out, and validated in active deployment."
          index="04"
          label="Hardware Initiatives"
          title={
            <>
              From RTL to
              <br />
              real-world <span className="accent-text">tapeouts.</span>
            </>
          }
        />

        <div className="project-area">
          <div className="content-notice" data-reveal>
            <ContentBadge variant={live ? "live" : "default"}>
              {live ? "● Live Server Registry" : "Hardware Node Registry"}
            </ContentBadge>
            <p>
              Active repositories and silicon tapeouts maintained by AAVESH hardware nodes at IIIT Una.
            </p>
          </div>
          <div className="project-grid">
            {(projects || []).map((project, index) => {
              const imageSrc = projectImages[index % projectImages.length]
              const statusLabel = (project.status || "active").toUpperCase()

              return (
                <article className="project-card" data-reveal key={project.slug || project.title}>
                  <div className="project-card__image">
                    <img alt={project.title} loading="lazy" src={imageSrc} />
                    <span>0{index + 1}</span>
                  </div>
                  <div className="project-card__body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <ContentBadge>{project.track || "ELECTRONICS"}</ContentBadge>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--mono)", color: "#00f0ff" }}>
                        [{statusLabel}]
                      </span>
                    </div>
                    <Heading as="h3">{project.title}</Heading>
                    <p>{project.summary}</p>
                    <div className="tag-row">
                      {(project.tags || []).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function Events() {
  return (
    <section
      aria-labelledby="events-title"
      className="section section--ruled"
      id="events"
    >
      <div className="container split-section">
        <SectionIntro
          description="Workshops, hackathons, and technical bootcamps designed for hands-on mastery."
          index="05"
          label="Events"
          title={
            <>
              Upcoming
              <br />
              sessions.
            </>
          }
        />

        <div className="events-grid">
          <article className="event-feature" data-reveal>
            <ImageWithCredit
              alt="Engineering students collaborating in a workshop"
              credit="AAVESH Hands-On Lab · IIIT Una"
              src="/images/workshop.jpg"
            />
            <div className="event-feature__body">
              <ContentBadge>Semester 2026/27</ContentBadge>
              <Heading as="h3">Hardware & Silicon Workshop Series</Heading>
              <div className="event-meta">
                <span>
                  <CalendarDays aria-hidden="true" size={16} />
                  Announced each semester
                </span>
                <span>
                  <MapPin aria-hidden="true" size={16} />
                  Saloh Campus, IIIT Una
                </span>
              </div>
              <p>
                From schematic capture in KiCad to embedded C firmware and FPGA synthesis—join our interactive student bootcamps.
              </p>
              <ButtonLink href="#contact" variant="secondary">
                Inquire about events
                <ArrowRight aria-hidden="true" size={16} />
              </ButtonLink>
            </div>
          </article>

          <div className="event-stack">
            {[
              {
                icon: CircuitBoard,
                label: "PCB Design Sprints",
                copy: "Schematic design, DRC routing, and surface mount soldering",
              },
              {
                icon: Code2,
                label: "Embedded Hackathons",
                copy: "48-hour hardware-software integration challenges",
              },
              {
                icon: Radio,
                label: "RF & Signal Labs",
                copy: "Software-defined radio and spectrum sensing demos",
              },
            ].map(({ copy, icon: Icon, label }) => (
              <article className="event-mini" data-reveal key={label}>
                <Icon aria-hidden="true" />
                <div>
                  <ContentBadge>Curriculum Track</ContentBadge>
                  <Heading as="h3">{label}</Heading>
                  <p>{copy}</p>
                </div>
                <ChevronRight aria-hidden="true" size={18} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  return (
    <section
      aria-labelledby="gallery-title"
      className="section section--ruled"
      id="gallery"
    >
      <div className="container">
        <div className="section-heading-row mb-6">
          <SectionIntro
            description="Moments from our test benches, fabrication workshops, and competition deployments."
            index="06"
            label="Visual Registry"
            title={
              <>
                Moments that
                <br />
                build the future.
              </>
            }
          />
        </div>

        {/* 3D DepthCarousel from React Bits */}
        <div style={{ height: "460px", position: "relative", width: "100%" }} data-reveal>
          <DepthCarousel
            autoplay={true}
            autoplayDelay={3000}
            blur={6}
            cardHeight={380}
            cardWidth={320}
            depth={220}
            falloff={0.2}
            items={gallery}
            loop={true}
            perspective={1400}
            showControls={true}
            showIndicators={true}
            spread={90}
            tilt={22}
            tiltDirection="right"
            visibleCards={4}
          />
        </div>
      </div>
    </section>
  )
}

function Team({ members }) {
  const teamMenuItems = members && members.length > 0
    ? members.map((m, i) => ({
        image: m.image || (i % 2 === 0 ? "/images/circuit-board.jpg" : "/images/soldering.jpg"),
        title: m.name,
        description: `${m.role} · ${m.track || 'Core Division'}`,
      }))
    : [
        {
          image: "/images/circuit-board.jpg",
          title: "Faculty Mentorship",
          description: "Guidance & Institutional Direction · IIIT Una",
        },
        {
          image: "/images/soldering.jpg",
          title: "VLSI & Hardware Core",
          description: "RTL, FPGA, and Custom PCB Architecture Teams",
        },
        {
          image: "/images/robotics.jpg",
          title: "RF & Signal Intelligence",
          description: "Spectrum sensing, antenna & RF front-end design",
        },
        {
          image: "/images/workshop.jpg",
          title: "Software & Autonomous Systems",
          description: "ROS 2, Edge AI, sensor fusion & RTOS pipelines",
        },
      ]

  return (
    <section
      aria-labelledby="team-title"
      className="section section--ruled"
      id="team"
    >
      <div className="container">
        <div className="section-heading-row mb-6">
          <SectionIntro
            description="A student-led technical collective supported by faculty mentorship and driven by passionate builders."
            index="07"
            label="Node Registry & Team"
            title={
              <>
                Builders behind
                <br />
                <span className="accent-text">AAVESH.</span>
              </>
            }
          />
        </div>

        {/* 3D InfiniteMenu for Members of the Club from React Bits */}
        <div style={{ height: "520px", position: "relative", width: "100%", borderRadius: "24px", overflow: "hidden" }} data-reveal>
          <InfiniteMenu
            accentColor="#00f0ff"
            autoplay={3.5}
            count={80}
            dim={0.2}
            grayscale={false}
            inertia={0.65}
            intro={true}
            items={teamMenuItems}
            pullBack={1}
            roundness={0.25}
            showInfo={true}
            stretch={0.6}
            theme="dark"
            tileSize={0.65}
            zoom={1.6}
          />
        </div>
      </div>
    </section>
  )
}

function Sponsors() {
  return (
    <section
      aria-labelledby="sponsors-title"
      className="section section--ruled"
      id="sponsors"
    >
      <div className="container sponsors-layout">
        <SectionIntro
          description="Industry partnerships and research grants provide student engineers with chips, lab benches, and mentorship."
          index="08"
          label="Partners & Sponsors"
          title={
            <>
              Power the next
              <br />
              generation of hardware.
            </>
          }
        />
        <div className="sponsor-panel" data-reveal>
          <div className="sponsor-panel__status">
            <span className="status-dot" />
            <div>
              <ContentBadge>Partnership Channels Open</ContentBadge>
              <Heading as="h3">
                Collaborate on silicon, hardware grants &amp; technical workshops.
              </Heading>
              <p>
                AAVESH welcomes fab houses, component suppliers, EDA vendors, and hardware companies to collaborate on student projects and hackathons.
              </p>
            </div>
          </div>
          <ButtonLink href="#contact">
            Discuss Partnership
            <ArrowRight aria-hidden="true" size={17} />
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

function Contact({ society }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "General Inquiry",
    message: "",
  })
  const [status, setStatus] = useState({ state: "idle", text: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ state: "busy", text: "TRANSMITTING TO AAVESH LAB…" })

    try {
      await api.sendMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.type || "General Inquiry",
        message: formData.message,
      })

      setFormData({
        name: "",
        email: "",
        type: "General Inquiry",
        message: "",
      })

      setStatus({
        state: "success",
        text: "[ACK] MESSAGE LOGGED TO SERVER. WE RESPOND WITHIN 48H.",
      })
    } catch (err) {
      const detail =
        err instanceof ApiRequestError && err.details
          ? ` — ${err.details.join("; ")}`
          : " — API OFFLINE / VERIFY BACKEND CONNECTION."
      setStatus({
        state: "error",
        text: `[NACK] ${err.message}${detail}`,
      })
    }
  }

  return (
    <section
      aria-labelledby="contact-title"
      className="contact-section"
      id="contact"
    >
      <div aria-hidden="true" className="contact-section__image" />
      <div className="container contact-grid">
        <div className="contact-copy" data-reveal>
          <SectionLabel index="09">Contact Uplink</SectionLabel>
          <Heading className="section-title" id="contact-title">
            Open a channel
            <br />
            to the <span className="accent-text">lab.</span>
          </Heading>
          <p>
            Have a collaboration idea, silicon tapeout inquiry, or workshop proposal? Messages persist directly to the AAVESH server.
          </p>
          <div className="contact-detail">
            <Mail aria-hidden="true" />
            <span>{society?.email || "aavesh@iiitu.ac.in"}</span>
          </div>
          <div className="contact-detail" style={{ marginTop: "0.5rem" }}>
            <MapPin aria-hidden="true" />
            <span>{society?.institute || "Indian Institute of Information Technology Una"}, Saloh Campus</span>
          </div>
        </div>

        <form className="contact-form" data-reveal onSubmit={handleSubmit}>
          <div className="field-row">
            <label className="field">
              <span>Your Name *</span>
              <input
                name="name"
                onChange={handleChange}
                placeholder="Nikola Tesla"
                required
                type="text"
                value={formData.name}
              />
            </label>
            <label className="field">
              <span>Email Address *</span>
              <input
                name="email"
                onChange={handleChange}
                placeholder="you@iiitu.ac.in"
                required
                type="email"
                value={formData.email}
              />
            </label>
          </div>
          <label className="field">
            <span>Inquiry Subject</span>
            <select
              name="type"
              onChange={handleChange}
              value={formData.type}
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Hardware Collaboration">Hardware & Tapeout Collaboration</option>
              <option value="Workshop Proposal">Workshop / Bootcamp Proposal</option>
              <option value="Industry Sponsorship">Industry Sponsorship & Grants</option>
              <option value="Membership Question">Society Membership Question</option>
            </select>
          </label>
          <label className="field">
            <span>Payload / Message *</span>
            <textarea
              name="message"
              onChange={handleChange}
              placeholder="Describe your project, timeline, or inquiry for the society..."
              required
              rows={5}
              value={formData.message}
            />
          </label>
          <div className="form-footer">
            <button
              className="button button--primary"
              disabled={status.state === "busy"}
              type="submit"
            >
              {status.state === "busy" ? "Transmitting…" : "Transmit Uplink"}
              <Send aria-hidden="true" size={16} />
            </button>
            <p
              aria-live="polite"
              className={`form-status ${status.state !== "idle" ? "is-visible" : ""}`}
              style={{
                color:
                  status.state === "error"
                    ? "#ff5555"
                    : status.state === "success"
                      ? "#00f0ff"
                      : "var(--text-muted)",
              }}
            >
              {status.text}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}


export default function App() {
  const { society, tracks, projects, members, live } = useSociety()
  const [reverseFlow, setReverseFlow] = useState(false)
  const [introKey, setIntroKey] = useState(0)
  const [forceIntro, setForceIntro] = useState(false)

  const handleReplayIntro = () => {
    sessionStorage.removeItem("aavesh_intro_seen")
    setForceIntro(true)
    setIntroKey((prev) => prev + 1)
  }

  const handleToggleReverseFlow = () => {
    setReverseFlow((prev) => !prev)
  }

  // Interactive 3D Tilt & Radial Spotlight for cards (desktop only)
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return

    const handleCardMove = (e) => {
      const card = e.target?.closest(
        ".domain-card, .project-card, .event-feature, .gallery-card, .team-card",
      )
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty("--mouse-x", `${x}px`)
      card.style.setProperty("--mouse-y", `${y}px`)

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotX = ((y - centerY) / centerY) * -5
      const rotY = ((x - centerX) / centerX) * 5
      card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px)`
    }

    const handleCardLeave = (e) => {
      const card = e.target?.closest(
        ".domain-card, .project-card, .event-feature, .gallery-card, .team-card",
      )
      if (card) {
        card.style.transform = ""
      }
    }

    window.addEventListener("mousemove", handleCardMove, { passive: true })
    window.addEventListener("mouseout", handleCardLeave, { passive: true })

    return () => {
      window.removeEventListener("mousemove", handleCardMove)
      window.removeEventListener("mouseout", handleCardLeave)
    }
  }, [])

  // Bidirectional GSAP ScrollTriggers: plays forward on scroll down AND in reverse on scroll up
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reduceMotion) return

    const context = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((element) => {
        gsap.fromTo(element, { opacity: 0, y: 28 }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            start: "top 88%",
            end: "bottom 8%",
            trigger: element,
            toggleActions: "play reverse play reverse",
          },
        })
      })

      gsap.utils.toArray(".section-label span:first-child").forEach((el) => {
        gsap.fromTo(el, { y: -14 }, {
          y: 14,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        })
      })
    })

    return () => context.revert()
  }, [])

  return (
    <DefaultLayout
      forceIntro={forceIntro}
      introKey={introKey}
      onIntroComplete={() => setForceIntro(false)}
      onReplayIntro={handleReplayIntro}
      onToggleReverseFlow={handleToggleReverseFlow}
      reverseFlow={reverseFlow}
      society={society}
    >
      <Hero
        onToggleReverseFlow={handleToggleReverseFlow}
        reverseFlow={reverseFlow}
      />
      <ScrollShowcase />
      <Events />
      <Gallery />
      <Team members={members} />
      <Sponsors />
      <Contact society={society} />
    </DefaultLayout>
  )
}