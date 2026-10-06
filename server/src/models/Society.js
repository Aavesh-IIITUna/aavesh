import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const societySchema = new mongoose.Schema(
  {
    key: { type: String, default: 'aavesh', unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    mission: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    institute: { type: String, trim: true },
    instituteUrl: { type: String, trim: true },
    accreditation: { type: String, trim: true },
    location: {
      sector: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      pincode: { type: String, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    socials: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      discord: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    metrics: {
      clockRate: { type: String, default: '50.000 Hz' },
      facility: { type: String, default: 'Saloh Campus' },
      institution: { type: String, default: 'IIIT Una' },
      council: { type: String, default: 'Student Gymkhana' },
    },
    tracks: { type: [trackSchema], default: [] },
    subDomains: {
      code: { type: String, default: '01' },
      title: { type: String, default: 'VLSI & Silicon' },
      note: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

export const Society = mongoose.model('Society', societySchema);