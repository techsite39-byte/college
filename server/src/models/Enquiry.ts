import mongoose, { Schema } from 'mongoose';

const enquirySchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, default: '' },
    courseInterest: { type: String, default: '' },
    message: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: ['new', 'reviewed', 'contacted', 'closed'], default: 'new' },
    notificationStatus: { type: String, enum: ['pending', 'sent', 'failed', 'not_configured'], default: 'pending' },
  },
  { timestamps: true },
);

enquirySchema.index({ status: 1, createdAt: -1 });

enquirySchema.index({ email: 1, phone: 1, createdAt: -1 });

export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
