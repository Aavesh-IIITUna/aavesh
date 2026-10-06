import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    subject: { type: String, trim: true, maxlength: 140, default: 'General' },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 4000,
    },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const ContactMessage = mongoose.model('ContactMessage', messageSchema);