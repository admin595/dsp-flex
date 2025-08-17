
# DSP Flex v2 — Stable DB Build (Render + Vercel)

## API (Render) — JavaScript + Prisma (no TypeScript build)

**Repo structure**
```
api/
  package.json           # "start": "node src/index.js"
  prisma/
    schema.prisma        # Postgres schema (correct relations)
  src/
    index.js             # Express server + Prisma; seeds default board on first request
frontend/
  ... (ignored by Render; Vercel uses this)
```

**Render settings (IMPORTANT)**
- Root Directory: `api`
- Environment:
  - `DATABASE_URL=<Render Postgres INTERNAL URL>`
- Build Command:
  ```
  npm install && npx prisma generate && npx prisma db push --accept-data-loss
  ```
- Start Command:
  ```
  npm start
  ```

After deploy, test:
- `https://<your-api>.onrender.com/health` → `{ ok: true }`
- `https://<your-api>.onrender.com/boards/default` → board + tasks JSON

Data will **persist** (Postgres).

## Frontend (Vercel)
- Root Directory: `frontend`
- Env:
  - `NEXT_PUBLIC_API_URL=https://<your-api>.onrender.com`
- Push to `main` → Vercel auto-deploys.

## Notes
- This build avoids TypeScript compilation and ESM vs CJS issues on Render.
- When you're ready, we can switch to migrations (`prisma migrate`) instead of `db push`.
