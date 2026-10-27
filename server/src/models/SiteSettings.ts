import mongoose, { Schema } from 'mongoose';

const siteSettingsSchema = new Schema(
  {
    institutionName: { type: String, default: 'Sri Aurobindo College of Education' },
    logo: { type: String, default: '' },
    contactDetails: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    address: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    announcement: {
      text: { type: String, default: '' },
      link: { type: String, default: '' },
      isActive: { type: Boolean, default: false },
    },
    admissionStatus: {
      status: { type: String, default: 'Unconfirmed' },
      message: { type: String, default: '' },
    },
    seo: {
      defaultTitle: String,
      defaultDescription: String,
      defaultKeywords: [String],
    },
  },
  { timestamps: true },
);

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
