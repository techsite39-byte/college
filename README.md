# Sri Aurobindo College of Education

Responsive public website and a MongoDB-backed Express API for the college. The public site uses institutional copy and photographs available from the official college website; current notices, events, achievements, courses and contact settings are read from published database records rather than invented demo content.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB (local or Atlas)

## Local setup

1. Install workspace dependencies:

   ```bash
   npm install
   ```

2. Copy `server/.env.example` to `server/.env`. Set a MongoDB connection string and a random `JWT_SECRET` with at least 32 characters. The API will not start without both.

3. Start the application:

   ```bash
   npm run dev
   ```

   The Vite client runs at `http://localhost:5173`; Express runs at `http://localhost:5001`. The development client proxies `/api` to the server.

4. Visit `/admin/login` to manage content. Database content starts empty; create and publish verified records in the dashboard before they appear publicly.

## First administrator

There are no default administrator credentials. For the initial bootstrap only, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`. Use a unique password of at least 12 characters. Starting the server creates that administrator if the email does not already exist. Remove both variables from the environment after the first successful creation. Changing these variables later does not reset an existing account’s password.

## Environment configuration

See [`server/.env.example`](./server/.env.example) and [`client/.env.example`](./client/.env.example).

- `MONGODB_URI`: required MongoDB connection.
- `JWT_SECRET`: required random secret (minimum 32 characters).
- `CLIENT_URL`: comma-separated allowlist of frontend origins.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: first-run admin bootstrap only.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFICATION_EMAIL`: optional enquiry notification delivery. Enquiries are stored even if email is unavailable or fails; the delivery outcome is recorded.
- `VITE_API_URL`: set to the API origin for a separately hosted frontend. Leave empty locally to use Vite’s proxy.

Cloudinary variables enable authenticated admin media uploads through `POST /api/admin/uploads` using a multipart `file` field. JPEG, PNG, WebP, AVIF and PDF files up to 15 MB are accepted. The endpoint returns a Cloudinary URL and public id; the admin dashboard inserts the URL into the active draft JSON. `DELETE /api/admin/uploads` removes a Cloudinary asset when given its `publicId` and optional `resourceType: "raw"`.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run start
```

`npm run build` builds both the React client and the TypeScript server. The API production process requires its environment variables and a reachable MongoDB instance.

## API

- `GET /api/health`
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/public/site-settings`, `/pages`, `/courses`, `/courses/:slug`, `/notices`, `/notices/:slug`, `/events`, `/events/:slug`, `/gallery`, `/achievements`
- `POST /api/enquiries`
- `POST /api/admin/uploads`, `DELETE /api/admin/uploads` (authenticated Cloudinary media management)
- `GET /api/admin/dashboard`
- `/api/admin/{courses,notices,events,gallery,achievements,pages,site-settings}` for authenticated content management
- `GET/PATCH/DELETE /api/admin/enquiries`

Admin enquiry listing supports `page`, `limit`, `status`, `courseInterest` and `q` filters. Enquiry updates accept a validated status and/or private `internalNotes` field.

Admin API operations are protected by server-side authentication and role checks. Login sessions use HttpOnly cookies, origin allowlisting, rate limits and server-side validation.

## Deployment notes

- Build the client and server with `npm run build`.
- Deploy `client/dist` to a static host and `server/dist/server.js` to a Node-compatible host.
- Set `VITE_API_URL` during the client build to the API origin, and configure `CLIENT_URL` on the API to the frontend origin.
- Configure production MongoDB, JWT, Cloudinary, and (if desired) SMTP values in the hosting provider’s secret manager. Do not commit `.env` files.
- Use HTTPS in production; authentication cookies are marked Secure and use `SameSite=None` for a separate frontend/API origin. The API additionally checks request origins on state-changing routes.
- Before launch, confirm the institutional facts, contact details, course/admissions information, image permissions, privacy policy and legal terms with the college.

## Content and verification

Information shown as institutional fact is sourced from the official website. Course availability, eligibility, intake, fees, deadlines, current announcements and direct contact details are intentionally left unpublished until confirmed. Published content is managed in MongoDB through the administrator dashboard.
