# Job Portal

Job Portal connects job seekers with employers. Visitors can browse open listings, job seekers can apply with a PDF resume and track their applications, and employers can post openings and review applicants. Administrators can manage users and listings.

## Features

| Role | What you can do |
| --- | --- |
| Job seeker | Search open jobs by title, location, work type, or minimum salary. Upload or reuse a PDF resume up to 5 MiB, apply with an optional cover letter, and track application status. |
| Employer | Create, edit, close, reopen, and delete your own listings. Review applicants, shortlist or reject them, and download the PDF submitted with each application. Search public professional profiles and export results as CSV when Exa is configured. |
| Administrator | View platform totals, browse users and jobs, remove non-admin accounts or job listings, and review applicants. Admins can also use Exa search when configured. |

The homepage shows recent open jobs. Signed-in requests use JWT bearer tokens, and the API enforces role and ownership checks. Public registration creates seeker or employer accounts. Provision administrators through trusted database administration using the [User model](backend/models/User.js) so passwords are hashed.

## Tech stack

- **Frontend** — React, React Router, Axios, Create React App (`react-scripts`), and CSS.
- **Backend** — Node.js, Express, MongoDB with Mongoose, `jsonwebtoken`, bcryptjs, and Multer.
- **Search and tests** — Exa Search API via Node’s `fetch`, Jest and React Testing Library on the frontend, and Node’s built-in test runner on the backend.

## Screenshots

| Screen | Placeholder |
| --- | --- |
| Homepage and job search | Add a real screenshot of the homepage showing search and recent jobs. |
| Seeker dashboard | Add a real screenshot showing application history and status. |
| Employer dashboard | Add a real screenshot showing posted jobs and management actions. |
| Applicant review | Add a real screenshot showing applicant controls with test data. |
| Admin dashboard | Add a real screenshot of the overview or management table. |

## Local setup on Windows

Install Node.js 22 or newer with npm, MongoDB Community Server, and MongoDB Shell (`mongosh`). The commands below use PowerShell. If `mongod` is outside your `PATH`, use the full path to `mongod.exe`.

### 1. Start a local MongoDB replica set

The API uses transactions for operations that update related users, jobs, or applications. A standalone MongoDB instance cannot run those transactions. A single-node replica set is sufficient for local development.

In one terminal, start MongoDB with a new local data directory. Keep this terminal open. If a standalone MongoDB service is already listening on port `27017`, use a free port and update the commands and URI consistently.

```powershell
$mongoData = Join-Path $env:LOCALAPPDATA 'JobPortal\mongo-rs0'
New-Item -ItemType Directory -Force -Path $mongoData | Out-Null
mongod --dbpath "$mongoData" --bind_ip localhost --port 27017 --replSet rs0
```

In another terminal, connect directly to the local node.

```powershell
mongosh 'mongodb://localhost:27017/?directConnection=true'
```

Run the following inside `mongosh` once for this data directory. Wait until `db.hello().isWritablePrimary` returns `true` before starting the API.

```javascript
rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })
db.hello().isWritablePrimary
```

### 2. Configure and start the backend

Create `backend/.env`, which Git ignores. Replace the JWT placeholder with a unique secret before starting the API. A local generation command is `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.

```dotenv
MONGO_URI=mongodb://localhost:27017/job_portal_dev?replicaSet=rs0
JWT_SECRET=<generate-secret>
CORS_ORIGINS=http://localhost:3000
```

From the repository root in a new terminal, run the backend on port `5000`.

```powershell
Set-Location .\backend
npm.cmd ci
npm.cmd start
```

### 3. Start the frontend

From the repository root in a separate terminal, run the React app and open [http://localhost:3000](http://localhost:3000). The committed development setting points to `http://localhost:5000/api`.

```powershell
Set-Location .\frontend
npm.cmd ci
npm.cmd start
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Backend | Required. Connection string for a replica set or a sharded deployment that supports transactions. |
| `JWT_SECRET` | Backend | Required. A random secret of at least 32 bytes. Changing it invalidates existing tokens. |
| `PORT` | Backend | Optional. Defaults to `5000`. |
| `CORS_ORIGINS` | Backend | Optional. Comma-separated exact HTTP(S) origins. Set `http://localhost:3000` for the setup above. |
| `TRUST_PROXY_HOPS` | Backend | Optional. Defaults to `0`. Set it only for a known proxy topology that controls forwarded headers. |
| `RESUME_DIR` | Backend | Optional. Private, writable PDF storage. Defaults to `backend/private-resumes`. Relative paths are resolved from `backend/`. |
| `EXA_API_KEY` | Backend | Optional. Enables employer and admin people search. |
| `REACT_APP_API_URL` | Frontend | API base URL including `/api`. For a different local port, override it in `frontend/.env.development.local` or in the shell, then restart React. For a production build, set it in the build environment. |

Keep backend secrets in `backend/.env` or a server-side secret store. React environment variables are visible in the browser bundle. Resumes are stored on disk and served through authenticated endpoints. Keep the storage directory private and durable if running outside local development.

## Exa integration

Set `EXA_API_KEY=<your-exa-api-key>` in `backend/.env` and restart the API. Employers and admins can then use **Find candidates** and **Find contacts**. The backend calls Exa and keeps the credential server-side. The rest of the portal works without a key.

Exa usage may be subject to provider rate limits, quotas, and charges. The optional command `npm.cmd run exa:check` from `backend/` makes one live search requesting one result. The automated tests use mocked provider responses or a blank key.

## Testing

Install dependencies with `npm.cmd ci` in each folder before running its commands.

| Directory | Command | What it checks |
| --- | --- | --- |
| `frontend/` | `npm.cmd test -- --watchAll=false --runInBand` | Runs the frontend Jest suite once. |
| `frontend/` | `npm.cmd run build` | Checks the production build. |
| `backend/` | `npm.cmd run check` | Checks JavaScript syntax. |
| `backend/` | `npm.cmd test` | Runs backend tests. Set `MONGOD_BINARY` to include database integration tests. |

Run the full backend suite from `backend/`, replacing the example path with your installed `mongod.exe` path. The suite starts a separate replica set on a loopback port with a temporary data directory and leaves your development database alone.

```powershell
$env:MONGOD_BINARY = 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe'
npm.cmd test
```

## Project structure

```text
backend/
  app.js, server.js   Express app and server startup
  config/            Environment and MongoDB setup
  routes/            API endpoints and route-level permissions
  controllers/       Request handlers
  middleware/        Authentication, validation, limits, and errors
  models/            Mongoose schemas
  services/          Exa, job ownership, resume storage, and deletion
  scripts/, test/    Checks and automated backend tests
frontend/
  public/            HTML shell and static assets
  src/
    App.js           Client routes and role guards
    pages/           Public pages and role dashboards
    components/      Shared UI and forms
    context/         Authentication state
    hooks/           Data loading
    services/        Axios client, sessions, and downloads
```
