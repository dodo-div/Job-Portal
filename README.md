# Job Portal

## Run locally

1. Install Node.js 22 or newer and start a local MongoDB replica set. For example, with MongoDB 8, create an empty data directory and run `mongod --dbpath ./local-mongo-data --bind_ip 127.0.0.1 --port 27017 --replSet rs0` in one terminal. In another, initialize it once with `mongosh --host 127.0.0.1 --port 27017 --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'`.
2. Create an ignored `backend/.env`. Set `MONGO_URI=mongodb://127.0.0.1:27017/job_portal_dev?replicaSet=rs0`. Use `node -p "require('node:crypto').randomBytes(32).toString('hex')"` to generate a local value for `JWT_SECRET`.
3. From `backend`, run `npm ci` and `npm start`. The default API is `http://localhost:5000/api`. Startup waits for MongoDB and index initialization.
4. From `frontend`, run `npm ci` and `npm start`. `.env.development` points the development server at `http://localhost:5000/api`. A shell value or `frontend/.env.development.local` can override `REACT_APP_API_URL`. Restart the development server after changing environment variables.

Public registration provisions seeker and employer accounts. Provision authorized admin accounts through trusted database administration using the User model to hash the password. The integration test demonstrates local admin creation and login.

| Backend variable | Purpose |
|---|---|
| `MONGO_URI` | Required. MongoDB replica set or sharded deployment with transaction support. |
| `JWT_SECRET` | Required. Use a random secret of at least 32 bytes. Changing it invalidates existing JWTs. |
| `PORT` | Defaults to `5000`. |
| `CORS_ORIGINS` | Comma-separated exact HTTP(S) frontend origins. Defaults to the existing deployed origins and `http://localhost:3000`. Set it explicitly for each hosted environment. |
| `TRUST_PROXY_HOPS` | Defaults to `0`. Configure it only for a known proxy topology that overwrites forwarded headers and prevents direct access to the app. |
| `RESUME_DIR` | Private writable storage. Defaults to `backend/private-resumes`. Relative paths resolve from the backend directory. Configure a durable volume for hosted operation. |
| `EXA_API_KEY` | Optional. Enables candidate search. Run `npm run exa:check` from `backend` for one search with one result requested. |

## API compatibility

- Production builds use the deployed API URL. Set `REACT_APP_API_URL` in the build environment to override it.
- The Applicants page uses the existing authenticated Axios client to download the application snapshot as `resume.pdf` from `GET /api/applications/:applicationId/resume`. The `/uploads/:filename` route was removed. A seeker can download their current PDF at `GET /api/upload/resume`.
- Resume uploads still use the `resume` multipart field. They now require a PDF up to 5 MiB. Applicant records retain the application-level `resume` value. The populated applicant and admin user lists omit the profile's resume filename.
- Existing list calls still return arrays. Callers may opt in with `page` and `limit` (up to 100) and read the `Link` header. Duplicate email registration and duplicate application attempts return `409`. Invalid values return `400` and rate-limited requests return `429`. Errors retain the `{ message }` shape.
- Job updates accept only editable fields. Candidate search accepts queries up to 500 characters and one to ten results. It returns `503` when credentials or quota are unavailable, `504` on timeout, and `502` for other upstream failures.

## Verification and rollout

Run from `backend`.

```powershell
npm ci
npm run check
npm test
npm audit
```

Set `MONGOD_BINARY` to the full path of your local `mongod` executable before running `npm test` to include database-backed tests. The tests start a fresh loopback-only replica set in a temporary directory. They use a generated local URI and do not read the application's `MONGO_URI`.

Before a rollout, review existing admin accounts and audit historical orphaned jobs and applications. Startup creates required indexes, so resolve any duplicate emails or applications in the target database beforehand. Deploy the authenticated frontend download call with the backend change. Move legacy files matching `resume-<userId>-<timestamp>.pdf` to the private volume without changing their names. The backend can also read these from existing local `uploads` directories through authorized endpoints. Invalid or missing legacy PDFs remain unavailable. Re-upload fixes the current profile resume. An existing application requires its original valid snapshot file.

Database cascades delete dependent records. PDF files persist on disk so replacement uploads can preserve old application snapshots. Plan retention and cleanup for unreferenced files, including files left by failed or interrupted writes. Keep the resume volume private, with restricted filesystem permissions and backups. PDF signature checks do not provide malware scanning. Rate limits are per process. A multi-instance rollout needs a shared rate-limit store and a shared private resume volume.
