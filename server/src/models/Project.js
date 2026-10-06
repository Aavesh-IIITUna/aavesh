import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    track: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'prototype'],
      default: 'active',
    },
    repoUrl: { type: String, trim: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Project = mongoose.model('Project', projectSchema);