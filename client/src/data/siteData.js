/**
 * Centralized Site Data Store
 * Provides unified, reusable data objects for navigation, gallery, team members,
 * technical domains, and sponsors across the application.
 */

export const navItems = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Domains", href: "#domains" },
  { label: "Projects", href: "#projects" },
  { label: "Events", href: "#events" },
  { label: "Gallery", href: "#gallery" },
  { label: "Team", href: "#team" },
  { label: "Sponsors", href: "#sponsors" }
];

export const galleryItems = [
  {
    image: "/images/soldering.jpg",
    alt: "Hands-on electronics soldering laboratory workshop",
    title: "Hands-on Electronics",
    credit: "Electronics Laboratory · IIIT Una",
    label: "Build"
  },
  {
    image: "/images/robotics.jpg",
    alt: "Robotics and kinematic node testing",
    title: "Robotics in Motion",
    credit: "Robotics Foundry · IIIT Una",
    label: "Test"
  },
  {
    image: "/images/workshop.jpg",
    alt: "Collaborative engineering student workshop",
    title: "Collaborative Workshops",
    credit: "Innovation Centre · IIIT Una",
    label: "Learn"
  },
  {
    image: "/images/circuit-board.jpg",
    alt: "Detailed dark blue printed circuit board architecture",
    title: "Inside the Hardware",
    credit: "VLSI Architecture Lab · IIIT Una",
    label: "Explore"
  }
];

export const galleryCollections = [
  {
    id: "build",
    code: "BUILD // 01",
    title: "Hands-on electronics",
    description: "Bench work, soldering, and the detail behind a clean prototype.",
    image: "/images/soldering.jpg",
    slides: galleryItems
  },
  {
    id: "test",
    code: "TEST // 02",
    title: "Robotics in motion",
    description: "Field tests, motion systems, and autonomous nodes under load.",
    image: "/images/robotics.jpg",
    slides: [...galleryItems.slice(1), galleryItems[0]]
  },
  {
    id: "learn",
    code: "LEARN // 03",
    title: "Collaborative workshops",
    description: "The shared experiments and reviews that move an idea forward.",
    image: "/images/workshop.jpg",
    slides: [...galleryItems.slice(2), ...galleryItems.slice(0, 2)]
  }
];

export const teamMembers = [
  {
    image: "/images/circuit-board.jpg",
    name: "Dr. Faculty Mentor",
    role: "Faculty Advisor",
    track: "Institutional Direction & Guidance",
    description: "Faculty Advisor & Mentorship · IIIT Una"
  },
  {
    image: "/images/soldering.jpg",
    name: "VLSI & Hardware Core",
    role: "Core Division",
    track: "RTL, FPGA & PCB Architecture",
    description: "RTL, FPGA, and Custom PCB Architecture Teams"
  },
  {
    image: "/images/robotics.jpg",
    name: "RF & Signal Intelligence",
    role: "Systems Division",
    track: "Spectrum Sensing & RF Front-Ends",
    description: "Spectrum sensing, antenna & RF front-end design"
  },
  {
    image: "/images/workshop.jpg",
    name: "Autonomous Systems Lead",
    role: "Software Division",
    track: "ROS 2, Edge AI & Sensor Pipelines",
    description: "ROS 2, Edge AI, sensor fusion & RTOS pipelines"
  }
];

export const domainItems = [
  {
    code: "HW.01",
    title: "Electronics",
    copy: "High-speed circuit design, multilayer PCB development, and signal integrity."
  },
  {
    code: "EM.02",
    title: "Embedded Systems",
    copy: "Bare-metal firmware, RTOS, sensor telemetry, and low-power hardware."
  },
  {
    code: "RB.03",
    title: "Robotics & IoT",
    copy: "Autonomous rovers, kinematic motion systems, and distributed IoT."
  },
  {
    code: "AI.04",
    title: "AI & Intelligence",
    copy: "On-device edge inference, real-time computer vision, and neural models."
  }
];

export const sponsorTiers = [
  "Hardware Lab Partner",
  "Component & Chip Grants",
  "Hackathon Title Patron",
  "Mentorship & Technical Fellowships"
];

export const showcaseStages = [
  {
    id: "about",
    number: "02",
    eyebrow: "About AAVESH",
    title: "AAVESH",
    accent: "#0077ff",
    body: "A student-driven technical society dedicated to hands-on engineering, hardware innovation, and collaborative building. We bridge silicon architecture, intelligent systems, and embedded firmware.",
    placement: "left",
    panel: "blue"
  },
  ...domainItems.map((domain, index) => ({
    id: domain.code,
    number: String(index + 3).padStart(2, "0"),
    eyebrow: domain.code,
    title: domain.title,
    accent: ["#00e5ff", "#a78bfa", "#f59e0b", "#34d399"][index],
    body: domain.copy,
    placement: index % 2 === 0 ? "right" : "left",
    panel: "white"
  }))
];

export const societyDetails = {
  name: "AAVESH // IIIT UNA",
  shortName: "AAVESH",
  tagline: "Electronics & Technology Society · IIIT Una",
  mission: "A student-driven technical society dedicated to hands-on engineering, hardware innovation, and collaborative building.",
  institute: "Indian Institute of Information Technology Una",
  facility: "Saloh Campus, Una [HP]",
  email: "aavesh@iiitu.ac.in",
  metrics: {
    clockRate: "240.000 MHz",
    facility: "Saloh Campus",
    institution: "IIIT Una",
    council: "Student Gymkhana"
  }
};
