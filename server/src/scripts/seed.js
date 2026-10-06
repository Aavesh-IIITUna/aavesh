import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Society } from '../models/Society.js';
import { Project } from '../models/Project.js';
import { Member } from '../models/Member.js';

const society = {
  key: 'aavesh',
  name: 'AAVESH // IIIT UNA',
  shortName: 'AAVESH',
  tagline: 'Electronics Society // IIIT UNA',
  mission:
    'Aavesh is an electronics society that strives to teach and help students acquire new skills in an era of rapidly evolving technology in the field of electronics and communication engineering. Empower students to acquire, demonstrate and articulate the value of knowledge and skills that will support them as lifelong lessons.',
  email: 'aavesh@iiitu.ac.in',
  institute: 'Indian Institute of Information Technology Una',
  instituteUrl: 'https://iiitu.ac.in',
  accreditation:
    'An Institute of National Importance under Ministry of Education, Govt. of India',
  location: {
    sector: 'SALOH, UNA [HP]',
    addressLine: 'Saloh, Una, Himachal Pradesh - 177209',
    pincode: '177209',
    lat: 31.48,
    lng: 76.19,
  },
  socials: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    discord: 'https://discord.com',
    instagram: 'https://instagram.com',
  },
  metrics: {
    clockRate: '50.000 Hz',
    facility: 'Saloh Campus',
    institution: 'IIIT Una',
    council: 'Student Gymkhana',
  },
  tracks: [
    { code: '01', title: 'VLSI & Microelectronics', order: 1 },
    { code: '02', title: 'Embedded Systems & IoT', order: 2 },
    { code: '03', title: 'Signal Processing & RF Systems', order: 3 },
    { code: '04', title: 'Robotics & Autonomous Nodes', order: 4 },
  ],
  subDomains: {
    code: '01',
    title: 'VLSI & Silicon',
    note: 'ASIC / FPGA Verification',
  },
};

const projects = [
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
    tags: ['sdr', 'rf', 'gnuradio'],
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

const members = [
  { name: 'Aarav Sharma', role: 'President', track: 'VLSI & Microelectronics', joinedYear: 2022 },
  { name: 'Ishita Nanda', role: 'Vice President', track: 'Signal Processing & RF Systems', joinedYear: 2023 },
  { name: 'Rohan Verma', role: 'Treasurer', track: 'Embedded Systems & IoT', joinedYear: 2023 },
];

async function seed() {
  await connectDB();

  await Society.deleteMany({});
  await Society.create(society);
  console.log('[seed] society upserted');

  await Promise.all(
    projects.map((p) => Project.findOneAndUpdate({ slug: p.slug }, p, { upsert: true })),
  );
  console.log(`[seed] ${projects.length} projects upserted`);

  await Promise.all(
    members.map((m) => Member.findOneAndUpdate({ name: m.name }, m, { upsert: true })),
  );
  console.log(`[seed] ${members.length} members upserted`);

  await mongoose.connection.close();
  console.log('[seed] done');
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});