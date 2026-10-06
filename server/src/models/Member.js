import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    track: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    joinedYear: { type: Number },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

memberSchema.index({ name: 1 }, { unique: true });

export const Member = mongoose.model('Member', memberSchema);