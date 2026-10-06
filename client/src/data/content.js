export const fallbackSociety = {
  name: 'AAVESH // IIIT UNA',
  shortName: 'AAVESH',
  tagline: 'ELECTRONICS SOCIETY // IIIT UNA',
  mission:
    'Aavesh is an electronics society that strives to teach and help students acquire new skills in an era of rapidly evolving technology in the field of electronics and communication engineering. Empower students to acquire, demonstrate and articulate the value of knowledge and skills that will support them as lifelong lessons.',
  email: 'aavesh@iiitu.ac.in',
  institute: 'Indian Institute of Information Technology Una',
  instituteUrl: 'https://iiitu.ac.in',
  accreditation:
    'An Institute of National Importance under Ministry of Education, Govt. of India',
  metrics: {
    clockRate: '50.000 Hz',
    facility: 'Saloh Campus',
    institution: 'IIIT Una',
    council: 'Student Gymkhana',
  },
};

export const fallbackTracks = [
  { code: '01', title: 'VLSI & Microelectronics' },
  { code: '02', title: 'Embedded Systems & IoT' },
  { code: '03', title: 'Signal Processing & RF Systems' },
  { code: '04', title: 'Robotics & Autonomous Nodes' },
];

export const fallbackProjects = [
  {
    slug: 'riscv-soc-tapeout',
    title: 'RISC-V SoC Tapeout',
    summary: 'Open-source 32-bit microcontroller built on a custom RTL core.',
    track: 'VLSI & Microelectronics',
    status: 'active',
    tags: ['riscv', 'rtl', 'asic'],
  },
  {
    slug: 'sdr-spectrum-scout',
    title: 'SDR Spectrum Scout',
    summary: '2.4GHz–5.8GHz RF node for campus spectrum sensing.',
    track: 'Signal Processing & RF Systems',
    status: 'prototype',
    tags: ['sdr', 'rf'],
  },
  {
    slug: 'autonomous-navigation-node',
    title: 'Autonomous Navigation Node',
    summary: 'Low-power LiDAR + inertial fusion rover controller.',
    track: 'Robotics & Autonomous Nodes',
    status: 'active',
    tags: ['robotics', 'embedded'],
  },
];

export const fallbackMembers = [
  { name: 'Aarav Sharma', role: 'President', track: 'VLSI & Microelectronics' },
  { name: 'Ishita Nanda', role: 'Vice President', track: 'Signal Processing & RF Systems' },
  { name: 'Rohan Verma', role: 'Treasurer', track: 'Embedded Systems & IoT' },
];

export const telemetryRows = [
  { label: 'LATENCY:', value: '0.42 ms [DIRECT]' },
  { label: 'ARCH:', value: 'RISC-V / RTL CORE' },
  { label: 'SPECTRUM:', value: '2.4GHz - 5.8GHz RF' },
  { label: 'NODE REGISTRY:', value: '128 VALIDATED' },
];

export const navLinks = [
  { label: 'RESEARCH', href: '#research', key: 'research' },
  { label: 'HARDWARE', href: '#hardware', key: 'hardware', active: true },
  { label: 'REGISTRY', href: '#registry', key: 'registry' },
  { label: 'CONTACT', href: '#contact', key: 'contact' },
];
