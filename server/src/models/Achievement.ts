import mongoose, { Schema } from 'mongoose';

const achievementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Academic' },
    achievementDate: { type: Date, required: true },
    image: { type: String, default: '' },
    attachment: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true },
);

achievementSchema.index({ status: 1, achievementDate: -1 });

export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);
