# HireHub MongoDB Schema

HireHub stores application data in MongoDB using Mongoose models. There are no SQL migrations to run; schemas live in TypeScript files under `src/models`.

## Collections

### users

Defined in `src/models/User.ts`.

Stores candidate and admin accounts:

- `email`: unique login email
- `passwordHash`: bcrypt hash
- `name`: display name
- `role`: `CANDIDATE` or `ADMIN`
- `profile`: nested candidate profile fields such as phone, resume URL, skills, experience, preferred location, preferred job type, and remote preference
- timestamps: `createdAt`, `updatedAt`

### companies

Defined in `src/models/Company.ts`.

Stores employer profile data:

- `name`: unique company name
- `initial`: short display initial
- `color`: frontend gradient class string
- `industry`
- `size`
- `website`
- timestamps

### jobs

Defined in `src/models/Job.ts`.

Stores job listings:

- `title`
- `companyId`: ObjectId reference to `companies`
- `postedById`: ObjectId reference to admin user
- `location`, `experience`, `salary`
- `type`: `FULL_TIME`, `PART_TIME`, `CONTRACT`, or `INTERNSHIP`
- `remote`: `REMOTE`, `HYBRID`, or `ON_SITE`
- `skills`, `requirements`, `responsibilities`, `benefits`: string arrays
- `category`
- `status`: `ACTIVE`, `DRAFT`, or `CLOSED`
- `featured`
- timestamps

### applications

Defined in `src/models/Application.ts`.

Stores candidate submissions:

- `jobId`: ObjectId reference to `jobs`
- `candidateId`: ObjectId reference to `users`
- `name`, `email`, `phone`: candidate snapshot at submission time
- `resumeUrl`
- `coverLetter`
- `status`: `PENDING`, `REVIEWED`, `ACCEPTED`, or `REJECTED`
- timestamps

Each candidate can apply to the same job only once.

### bookmarks

Defined in `src/models/Bookmark.ts`.

Stores saved jobs:

- `userId`: ObjectId reference to `users`
- `jobId`: ObjectId reference to `jobs`
- `createdAt`

Each user can bookmark the same job only once.

### newslettersubscriptions

Defined in `src/models/NewsletterSubscription.ts`.

Stores newsletter signups:

- `email`: unique subscriber email
- `createdAt`

## Seeding

Run this from `hirehub-backend`:

```bash
npm run db:seed
```

The seed script is `scripts/seed.ts`. It creates demo users, companies, jobs, and a newsletter subscription using Mongoose upserts, so it is safe to run more than once.

## Database Connection

The connection is configured in `src/config/database.ts` and reads:

- `MONGODB_URI`: required MongoDB connection string
- `MONGO_URI`: optional alias
- `MONGODB_DB`: optional database name override
