import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LayoutDashboard, LogOut, Save, Upload } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest, apiUpload } from '../lib/api';

const adminResources = [
  ['notices', 'Notices'],
  ['events', 'Events'],
  ['courses', 'Courses'],
  ['gallery', 'Gallery'],
  ['achievements', 'Achievements'],
  ['pages', 'Pages'],
  ['enquiries', 'Enquiries'],
  ['site-settings', 'Site settings'],
] as const;

type AdminUser = { id: string; name: string; email: string; role: string };
type PagedItems = { items: Record<string, unknown>[]; page: number; limit: number; total: number; pages: number };
type DashboardSummary = { enquiries: number; notices: number; events: number; courses: number };
type UploadedMedia = { url: string; publicId: string; resourceType: string; originalName: string };

const templates: Record<string, Record<string, unknown>> = {
  courses: { title: '', slug: '', shortDescription: '', fullDescription: '', eligibility: '', duration: '', intake: '', fees: '', image: '', documents: [], status: 'draft' },
  notices: { title: '', slug: '', content: '', category: 'General', attachment: '', publishedAt: new Date().toISOString(), expiresAt: null, isPinned: false, status: 'draft' },
  events: { title: '', slug: '', description: '', coverImage: '', startDate: new Date().toISOString(), endDate: new Date().toISOString(), venue: '', status: 'draft' },
  gallery: { title: '', imageUrl: '', altText: '', category: 'Campus', caption: '', sortOrder: 0, status: 'draft' },
  achievements: { title: '', description: '', category: 'Academic', achievementDate: new Date().toISOString(), image: '', attachment: '', status: 'draft' },
  pages: { title: '', slug: '', sections: [], seo: {}, status: 'draft' },
  'site-settings': { institutionName: 'Sri Aurobindo College of Education', contactDetails: { phone: '', email: '', website: '' }, address: '', announcement: { text: '', link: '', isActive: false }, admissionStatus: { status: 'Unconfirmed', message: '' } },
};

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLoginRoute = location.pathname === '/admin/login';
  const resource = location.pathname.split('/')[2] || 'dashboard';
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(() => JSON.stringify(templates[resource] || {}, null, 2));
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPage(1);
    setEditingId('');
    setEditor(JSON.stringify(templates[resource] || {}, null, 2));
    setMessage('');
    setUploadMessage('');
  }, [resource]);

  const authQuery = useQuery({
    queryKey: ['admin-user'],
    queryFn: () => apiRequest<AdminUser>('auth/me'),
    retry: false,
  });
  const isAuthenticated = Boolean(authQuery.data);

  const loginMutation = useMutation({
    mutationFn: (values: { email: string; password: string }) => apiRequest<{ user: AdminUser }>('auth/login', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      navigate('/admin/dashboard');
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Login failed.'),
  });

  const summaryQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiRequest<DashboardSummary>('admin/dashboard'),
    enabled: isAuthenticated && resource === 'dashboard',
    retry: false,
  });
  const contentQuery = useQuery({
    queryKey: ['admin-content', resource, page],
    queryFn: () => apiRequest<PagedItems | Record<string, unknown>>(`admin/${resource}?page=${page}&limit=20`),
    enabled: isAuthenticated && resource !== 'dashboard' && adminResources.some(([key]) => key === resource),
    retry: false,
  });
  const pagedContent = isPagedItems(contentQuery.data) ? contentQuery.data : undefined;
  const settingsContent = isRecord(contentQuery.data) && !isPagedItems(contentQuery.data) ? contentQuery.data : undefined;
  const records = pagedContent?.items ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      let data: unknown;
      try {
        data = JSON.parse(editor);
      } catch {
        throw new Error('The editor must contain valid JSON.');
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Enter a JSON object.');
      const method = editingId ? 'PATCH' : resource === 'site-settings' ? 'PUT' : 'POST';
      const path = editingId ? `admin/${resource}/${editingId}` : `admin/${resource}`;
      return apiRequest(path, { method, body: JSON.stringify(data) });
    },
    onSuccess: async () => {
      setEditingId('');
      setEditor(JSON.stringify(templates[resource] || {}, null, 2));
      setMessage('Changes saved.');
      await queryClient.invalidateQueries({ queryKey: ['admin-content', resource] });
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      await queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Could not save changes.'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`admin/${resource}/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      setMessage('Content deleted.');
      await queryClient.invalidateQueries({ queryKey: ['admin-content', resource] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Could not delete content.'),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status, internalNotes }: { id: string; status?: string; internalNotes?: string }) => apiRequest(`admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status, internalNotes }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-content', 'enquiries'] }),
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Could not update enquiry status.'),
  });
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('auth/logout', { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      navigate('/admin/login');
    },
  });

  const uploadMedia = async (file: File) => {
    setUploading(true);
    setUploadMessage('');
    try {
      const uploaded = await apiUpload<UploadedMedia>('admin/uploads', file);
      const content = JSON.parse(editor) as Record<string, unknown>;
      const field = resource === 'gallery' ? 'imageUrl' : resource === 'events' ? 'coverImage' : resource === 'achievements' ? 'image' : resource === 'notices' ? 'attachment' : resource === 'site-settings' ? 'logo' : 'image';
      if (resource === 'courses' && uploaded.resourceType === 'raw') {
        content.documents = [...(Array.isArray(content.documents) ? content.documents : []), uploaded.url];
      } else {
        content[field] = uploaded.url;
      }
      setEditor(JSON.stringify(content, null, 2));
      setUploadMessage(`Uploaded ${uploaded.originalName} and added its URL to the draft.`);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (isLoginRoute) {
    if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
    return <AdminLogin onSubmit={(email, password) => loginMutation.mutate({ email, password })} error={message} busy={loginMutation.isPending} />;
  }
  if (authQuery.isLoading) return <div className="grid min-h-screen place-items-center bg-ivory text-slate-600">Checking administrator session…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const activeResource = adminResources.find(([key]) => key === resource);
  if (resource !== 'dashboard' && !activeResource) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-navy lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-[#101b2d] p-5 text-white lg:min-h-screen lg:p-6">
        <Link to="/" className="text-display text-lg">Sri Aurobindo</Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">Administration</p>
        <nav aria-label="Admin navigation" className="mt-8 grid grid-cols-2 gap-1 lg:grid-cols-1">
          <AdminNav to="/admin/dashboard" label="Dashboard" active={resource === 'dashboard'} icon={<LayoutDashboard size={16} />} />
          {adminResources.map(([key, label]) => <AdminNav key={key} to={`/admin/${key}`} label={label} active={resource === key} />)}
        </nav>
        <button type="button" onClick={() => logoutMutation.mutate()} className="mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={16} /> Sign out</button>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div><p className="eyebrow">Content management</p><h1 className="text-display mt-2 text-3xl sm:text-4xl">{activeResource?.[1] || 'Dashboard'}</h1></div>
          <p className="text-sm text-slate-600">{authQuery.data?.name}</p>
        </header>

        {resource === 'dashboard' ? (
          <section>
            {summaryQuery.isLoading && <p role="status">Loading dashboard…</p>}
            {summaryQuery.isError && <ErrorMessage message="Dashboard data could not be loaded. Your session may have expired." />}
            {summaryQuery.data && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries(summaryQuery.data).map(([key, value]) => <div key={key} className="border border-navy/10 bg-white p-6"><p className="text-sm capitalize text-slate-500">{key}</p><p className="text-display mt-2 text-4xl">{value}</p></div>)}
            </div>}
            <div className="mt-8 border border-navy/10 bg-white p-6"><h2 className="text-display text-2xl">Manage published content</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose a section in the navigation to add, edit, publish or archive college content.</p></div>
          </section>
        ) : resource === 'enquiries' ? (
          <EnquiriesPanel
            items={records}
            loading={contentQuery.isLoading}
            error={contentQuery.isError}
            message={message}
            onStatus={(id, status) => statusMutation.mutate({ id, status })}
            onNotes={(id, internalNotes) => statusMutation.mutate({ id, internalNotes })}
            onDelete={(id) => { if (window.confirm('Delete this enquiry permanently?')) deleteMutation.mutate(id); }}
          />
        ) : (
          <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Existing records</h2>
                {pagedContent && <p className="text-sm text-slate-500">{pagedContent.total} total</p>}
              </div>
              {contentQuery.isLoading && <p role="status" className="py-6 text-sm text-slate-600">Loading content…</p>}
              {contentQuery.isError && <ErrorMessage message="Content could not be loaded. Check the API connection and administrator permissions." />}
              {resource === 'site-settings' && settingsContent && (
                <button type="button" onClick={() => setEditor(JSON.stringify(settingsContent, null, 2))} className="mb-4 border border-navy/10 bg-white p-4 text-left text-sm hover:border-gold">Load current site settings into the editor</button>
              )}
              <div className="space-y-3">
                {records.map((record) => {
                  const id = String(record._id || '');
                  return <article key={id} className="border border-navy/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="font-semibold">{String(record.title || record.institutionName || record.slug || 'Untitled')}</h3><p className="mt-1 text-xs text-slate-500">{String(record.status || 'settings')}</p></div>
                      <div className="flex shrink-0 gap-3 text-xs font-semibold">
                        <button type="button" onClick={() => { setEditingId(id); setEditor(JSON.stringify(record, null, 2)); setMessage(''); }} className="underline decoration-gold decoration-2 underline-offset-4">Edit</button>
                        <button type="button" onClick={() => { if (window.confirm('Delete this content?')) deleteMutation.mutate(id); }} className="text-red-700 underline underline-offset-4">Delete</button>
                      </div>
                    </div>
                  </article>;
                })}
                {!contentQuery.isLoading && !records.length && resource !== 'site-settings' && <p className="border border-navy/10 bg-white p-5 text-sm text-slate-600">No records yet. Use the editor to create one.</p>}
              </div>
              {pagedContent && pagedContent.pages > 1 && <div className="mt-5 flex items-center gap-3 text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border bg-white px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {pagedContent.pages}</span><button type="button" disabled={page >= pagedContent.pages} onClick={() => setPage((value) => value + 1)} className="rounded border bg-white px-3 py-2 disabled:opacity-40">Next</button></div>}
            </div>
            <form onSubmit={(event: FormEvent) => { event.preventDefault(); setMessage(''); saveMutation.mutate(); }} className="border border-navy/10 bg-white p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">{editingId ? 'Edit record' : 'Create record'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(''); setEditor(JSON.stringify(templates[resource] || {}, null, 2)); }} className="text-xs underline">Cancel edit</button>}</div>
              <p className="mb-4 text-xs leading-5 text-slate-500">Edit the JSON fields below. Use a unique lowercase slug with hyphens; set status to <code>published</code> only after verifying content.</p>
              <label className="sr-only" htmlFor="admin-json">Content JSON</label>
              <textarea id="admin-json" spellCheck={false} value={editor} onChange={(event) => setEditor(event.target.value)} className="min-h-[420px] w-full rounded-lg border border-navy/15 bg-[#faf9f6] p-4 font-mono text-xs leading-5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
              {resource !== 'pages' && resource !== 'enquiries' && <div className="mt-4 rounded-lg border border-dashed border-navy/20 bg-[#faf9f6] p-4">
                <label htmlFor="admin-media" className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><Upload size={15} />{uploading ? 'Uploading…' : 'Upload media'}<input id="admin-media" type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file); event.currentTarget.value = ''; }} /></label>
                <p className="mt-2 text-xs leading-5 text-slate-500">JPEG, PNG, WebP, AVIF or PDF up to 15 MB. The uploaded URL is inserted into the draft JSON.</p>
                {uploadMessage && <p role="status" className="mt-2 text-xs text-slate-700">{uploadMessage}</p>}
              </div>}
              <p role="status" aria-live="polite" className="my-3 min-h-5 text-sm text-slate-700">{message}</p>
              <button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={15} />{saveMutation.isPending ? 'Saving…' : 'Save content'}</button>
            </form>
          </section>
        )}
        <Link to="/" className="mt-10 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-navy"><ArrowLeft size={15} /> View public site</Link>
      </main>
    </div>
  );
}

function EnquiriesPanel({
  items,
  loading,
  error,
  message,
  onStatus,
  onNotes,
  onDelete,
}: {
  items: Record<string, unknown>[];
  loading: boolean;
  error: boolean;
  message: string;
  onStatus: (id: string, status: string) => void;
  onNotes: (id: string, internalNotes: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <p className="mb-4 text-sm leading-6 text-slate-600">Enquiry details are visible only to authenticated administrators.</p>
      {loading && <p role="status">Loading enquiries…</p>}
      {error && <ErrorMessage message="Enquiries could not be loaded. Check administrator permissions." />}
      {!loading && !error && !items.length && <p className="border border-navy/10 bg-white p-5 text-sm text-slate-600">No enquiries have been received.</p>}
      <div className="space-y-3">
        {items.map((item) => {
          const id = String(item._id || '');
          return <article key={id} className="grid gap-4 border border-navy/10 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-semibold">{String(item.fullName || 'Unknown applicant')}</h2>
              <p className="mt-1 text-sm text-slate-600">{String(item.email || '')} · {String(item.phone || '')}</p>
              {Boolean(item.subject) && <p className="mt-1 text-sm">Subject: {String(item.subject)}</p>}
              {Boolean(item.courseInterest) && <p className="mt-1 text-sm">Course interest: {String(item.courseInterest)}</p>}
              {Boolean(item.message) && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{String(item.message)}</p>}
              <p className="mt-2 text-xs text-slate-500">Notification: {String(item.notificationStatus || 'unknown')}</p>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor={`notes-${id}`}>Internal notes</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <textarea id={`notes-${id}`} defaultValue={String(item.internalNotes || '')} rows={2} className="min-h-16 w-full rounded border border-navy/15 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
                <button type="button" onClick={(event) => { const textarea = event.currentTarget.previousElementSibling; if (textarea instanceof HTMLTextAreaElement) onNotes(id, textarea.value); }} className="shrink-0 self-start rounded border border-navy/15 px-3 py-2 text-xs font-semibold hover:border-gold">Save notes</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`enquiry-${id}`}>Enquiry status</label>
              <select id={`enquiry-${id}`} value={String(item.status || 'new')} onChange={(event) => onStatus(id, event.target.value)} className="rounded border border-navy/15 bg-white px-2 py-2 text-sm">
                {['new', 'reviewed', 'contacted', 'closed'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button type="button" onClick={() => onDelete(id)} className="text-xs font-semibold text-red-700 underline underline-offset-4">Delete</button>
            </div>
          </article>;
        })}
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-sm text-slate-700">{message}</p>
    </section>
  );
}

function AdminLogin({ onSubmit, error, busy }: { onSubmit: (email: string, password: string) => void; error: string; busy: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <main className="grid min-h-screen place-items-center bg-[#101b2d] px-4 py-12">
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(email, password); }} className="w-full max-w-md border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
        <p className="eyebrow">Administrator access</p>
        <h1 className="text-display mt-3 text-3xl">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use the account configured by your site administrator.</p>
        <label className="mt-6 block text-sm font-medium">Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-navy/15 bg-ivory px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" /></label>
        <label className="mt-4 block text-sm font-medium">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-navy/15 bg-ivory px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" /></label>
        <p role="alert" className="mt-4 min-h-5 text-sm text-red-700">{error}</p>
        <button type="submit" disabled={busy} className="mt-3 w-full rounded-full bg-navy px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in securely'}</button>
        <Link to="/" className="mt-5 block text-center text-sm text-slate-500 hover:text-navy">Return to public site</Link>
      </form>
    </main>
  );
}

function AdminNav({ to, label, active, icon }: { to: string; label: string; active: boolean; icon?: React.ReactNode }) {
  return <Link to={to} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>{icon}{label}</Link>;
}

function ErrorMessage({ message }: { message: string }) {
  return <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</p>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPagedItems(value: unknown): value is PagedItems {
  return isRecord(value)
    && Array.isArray(value.items)
    && typeof value.page === 'number'
    && typeof value.limit === 'number'
    && typeof value.total === 'number'
    && typeof value.pages === 'number';
}
