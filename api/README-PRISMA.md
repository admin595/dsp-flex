
# Prisma Setup (API)

This folder adds the missing Prisma schema used by the API.

## Files
- prisma/schema.prisma  ← required by `npx prisma generate` and migrations
- .env.example          ← sample env for local dev

## Local (optional)
cd api
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev

## Render (production)
- Root Directory: api
- Environment Variables:
    DB_PROVIDER=postgresql
    DATABASE_URL=<Render Postgres INTERNAL URL>
- Build Command:
    npm install && npx prisma generate && npx prisma migrate deploy
- Start Command:
    npm start
