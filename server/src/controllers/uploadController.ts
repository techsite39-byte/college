import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

const cloudinaryUploadUrl = () => `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/auto/upload`;
const cloudinaryDestroyUrl = () => `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/destroy`;

function requireCloudinary() {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError('Cloudinary uploads are not configured on the server', 503);
  }
}

function signCloudinaryParams(params: Record<string, string>) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return createHash('sha1').update(`${serialized}${env.cloudinaryApiSecret}`).digest('hex');
}

export async function uploadMedia(req: Request, res: Response) {
  requireCloudinary();
  if (!req.file) throw new AppError('Choose an image or PDF file to upload', 400);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'sri-aurobindo-college';
  const signature = signCloudinaryParams({ folder, timestamp });
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }), req.file.originalname);
  form.append('api_key', env.cloudinaryApiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(cloudinaryUploadUrl(), { method: 'POST', body: form });
  const payload = await response.json() as { secure_url?: string; public_id?: string; resource_type?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new AppError(payload.error?.message || 'Cloudinary upload failed', 502);
  }

  res.status(201).json({
    success: true,
    data: {
      url: payload.secure_url,
      publicId: payload.public_id,
      resourceType: payload.resource_type || 'image',
      originalName: req.file.originalname,
    },
  });
}

export async function deleteMedia(req: Request, res: Response) {
  requireCloudinary();
  const publicId = typeof req.body?.publicId === 'string' ? req.body.publicId.trim() : '';
  const resourceType = req.body?.resourceType === 'raw' ? 'raw' : 'image';
  if (!publicId || publicId.length > 255) throw new AppError('A valid Cloudinary public id is required', 400);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signCloudinaryParams({ public_id: publicId, timestamp });
  const form = new URLSearchParams({
    public_id: publicId,
    api_key: env.cloudinaryApiKey,
    timestamp,
    signature,
  });
  const response = await fetch(`${cloudinaryDestroyUrl()}?resource_type=${resourceType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const payload = await response.json() as { result?: string; error?: { message?: string } };
  if (!response.ok || payload.result !== 'ok' && payload.result !== 'not found') {
    throw new AppError(payload.error?.message || 'Cloudinary deletion failed', 502);
  }

  res.json({ success: true, data: { result: payload.result } });
}
