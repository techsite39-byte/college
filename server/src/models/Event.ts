import mongoose, { Schema } from 'mongoose';

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true },
);

eventSchema.index({ status: 1, startDate: 1 });

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
