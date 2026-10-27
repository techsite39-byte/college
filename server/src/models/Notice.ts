import mongoose, { Schema } from 'mongoose';

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: 'General' },
    attachment: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    isPinned: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

noticeSchema.index({ status: 1, publishedAt: -1 });
noticeSchema.index({ isPinned: 1, status: 1 });

export const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
