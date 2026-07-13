# eRetail Replica

Next.js, NestJS, Tailwind CSS, and MongoDB implementation of a Vine Retail-style operations portal.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The frontend runs on `http://localhost:3000` and the API runs on `http://localhost:4000`.

Use the seeded demo login:

```text
Organization: ABCD
User: nnn
Password: ABCD@1122
```

The API falls back to in-memory data if MongoDB is unavailable, so the app remains usable for review. To run with MongoDB:

```bash
docker compose up -d mongo
```

## Production notes

- Set a strong `JWT_SECRET`.
- Set `WEB_ORIGIN` to the deployed frontend origin.
- Set `MONGODB_URI` to a managed MongoDB replica set.
- The API uses validation, CORS allow-listing, security headers, JWT route guards, and rate limiting.

## Render deployment

Do not run the root `npm run start:all` command on a single Render web service. Render assigns one `$PORT` per web service, so starting Next.js and NestJS in the same service causes `EADDRINUSE`.

Use the included `render.yaml` Blueprint, or create two Render web services manually:

- API service: build `npm ci && npm run build --workspace apps/api`, start `npm run start:api`
- Web service: build `npm ci && npm run build --workspace apps/web`, start `npm run start:web`

Set the API service env vars `JWT_SECRET`, `MONGODB_URI`, and `WEB_ORIGIN` or `WEB_ORIGIN_HOST`. Set the web service env var `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_HOST`.
