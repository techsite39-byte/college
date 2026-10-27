import mongoose, { Schema } from 'mongoose';

const galleryImageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    altText: { type: String, default: '' },
    category: { type: String, default: 'Campus' },
    caption: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true },
);

galleryImageSchema.index({ status: 1, sortOrder: 1 });

export const GalleryImage = mongoose.models.GalleryImage || mongoose.model('GalleryImage', galleryImageSchema);
