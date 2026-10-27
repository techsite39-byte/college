export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}/api/${path.replace(/^\/+/, '')}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const responseText = await response.text();
  let result: Partial<ApiEnvelope<T>> & { message?: string } = {};
  if (responseText) {
    try {
      result = JSON.parse(responseText) as Partial<ApiEnvelope<T>> & { message?: string };
    } catch {
      result.message = 'The server returned an unreadable response.';
    }
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result.data as T;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${apiBaseUrl}/api/${path.replace(/^\/+/, '')}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const responseText = await response.text();
  let result: Partial<ApiEnvelope<T>> & { message?: string } = {};
  if (responseText) {
    try {
      result = JSON.parse(responseText) as Partial<ApiEnvelope<T>> & { message?: string };
    } catch {
      result.message = 'The server returned an unreadable response.';
    }
  }
  if (!response.ok || !result.success) throw new Error(result.message || `Upload failed (${response.status})`);
  return result.data as T;
}
