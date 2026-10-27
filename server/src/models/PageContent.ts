import mongoose, { Schema } from 'mongoose';

const pageContentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    sections: [{ type: Schema.Types.Mixed }],
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

export const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', pageContentSchema);
