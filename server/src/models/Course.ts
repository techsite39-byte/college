import mongoose, { Schema } from 'mongoose';

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    eligibility: { type: String, default: '' },
    duration: { type: String, default: '' },
    intake: { type: String, default: '' },
    fees: { type: String, default: '' },
    image: { type: String, default: '' },
    documents: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true },
);

courseSchema.index({ status: 1, createdAt: -1 });

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
