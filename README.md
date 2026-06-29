# HireHub Backend

Express + TypeScript API for the HireHub job portal. The backend uses MongoDB Atlas with Mongoose models for users, companies, jobs, applications, bookmarks, and newsletter subscriptions.

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT authentication with bcrypt password hashing
- Multer for resume uploads
- Swagger UI at `/swagger`

## Project Structure

```text
src/
  app.ts                 Express app setup
  index.ts               Server entrypoint
  config/database.ts     MongoDB connection
  controllers/           Route handlers
  middlewares/           Auth and error middleware
  models/                Mongoose schemas
  routes/                API routes
scripts/seed.ts          Demo data seed script
uploads/                 Local resume upload folder
```

## Environment Variables

Create `hirehub-backend/.env` from `.env.example`:

```env
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/hirehub"
MONGODB_DB="hirehub"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

Use your own MongoDB Atlas connection string. Keep real secrets out of GitHub.

## Run Locally

```bash
cd hirehub-backend
npm install
npm run db:seed
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Build

```bash
npm run build
npm start
```

## Useful Scripts

- `npm run dev` starts the TypeScript dev server with nodemon.
- `npm run build` compiles TypeScript into `dist/`.
- `npm start` runs the compiled server.
- `npm run db:seed` inserts demo users, companies, jobs, and newsletter data into MongoDB.

## Demo Accounts After Seeding

- Admin: `admin@hirehub.com` / `Admin@1234`
- Candidate: `jane@hirehub.com` / `Candidate@1234`

## API Docs

Detailed route docs live in:

- `AUTH_API.md`
- `JOBS_API.md`
- `APPLICATIONS_API.md`
- `ADMIN_API.md`
- `DATABASE_SCHEMA.md`
