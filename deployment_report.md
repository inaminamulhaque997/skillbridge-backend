# SkillBridge Backend Deployment Report

**Deployment Date:** February 21, 2026  
**Deployment URL:** https://skillbridge-backend-sigma.vercel.app/  
**GitHub Repository:** https://github.com/inaminamulhaque997/skillbridge-backend

---

## GitHub Push Issues

### Issue 1: Git Repository Corruption
**Problem:** The `.git` folder became corrupted during the initial setup, showing as an invalid git repository.

**Error Message:**
```
fatal: not a git repository (or any of the parent directories): .git
```

**Resolution:** 
- Removed the corrupted `.git` folder
- Reinitialized the git repository with `git init`
- Recreated all commits

---

### Issue 2: GitHub CLI Not Authenticated
**Problem:** GitHub CLI (`gh`) was installed but not authenticated.

**Error Message:**
```
To get started with GitHub CLI, please run: gh auth login
```

**Resolution:**
- User authenticated GitHub CLI manually
- Used `gh auth login` to complete authentication

---

### Issue 3: Repository Already Exists
**Problem:** Attempted to create a repository that already existed on the GitHub account.

**Error Message:**
```
GraphQL: Name already exists on this account (createRepository)
```

**Resolution:**
- Added existing remote manually: `git remote add origin https://github.com/inaminamulhaque997/skillbridge-backend.git`
- Force pushed to update the existing repository

---

## Vercel Deployment Issues

### Issue 1: NOT_FOUND Error (404)
**Problem:** Initial deployment returned "NOT_FOUND" for all routes.

**Error Message:**
```
The page could not be found
NOT_FOUND
```

**Root Cause:** 
- The `vercel.json` configuration was pointing to `dist/server.js` which didn't exist
- Vercel serverless functions require TypeScript source files, not compiled JavaScript

**Resolution:**
- Created `api/index.ts` as the serverless entry point
- Updated `vercel.json` to point to `api/index.ts`

---

### Issue 2: Prisma Client Not Generated (500 Error)
**Problem:** All API requests returned 500 Internal Server Error due to missing Prisma Client.

**Error Message:**
```
PrismaClientInitializationError: Prisma has detected that this project was built on Vercel, 
which caches dependencies. This leads to an outdated Prisma Client because Prisma's 
auto-generation isn't triggered. To fix this, make sure to run the `prisma generate` 
command during the build process.
```

**Root Cause:**
- Vercel's `@vercel/node` builder doesn't run the `build` script from package.json
- Prisma Client needs to be generated after `npm install` completes
- The `build` script (`prisma generate && tsc`) was not being executed

**Resolution:**
- Added `postinstall` script to `package.json`:
```json
"postinstall": "prisma generate"
```
- This ensures `prisma generate` runs automatically after dependencies are installed

---

## Fixes Applied

### 1. Updated `vercel.json`
**Before:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

**After:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

---

### 2. Created `api/index.ts`
**New File:**
```typescript
import app from '../src/app.js';

export default app;
```

This serves as the entry point for Vercel serverless functions.

---

### 3. Updated `src/server.ts`
**Before:**
```typescript
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

**After:**
```typescript
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Only start the server if not running on Vercel (local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export app for Vercel serverless functions
export default app;
```

---

### 4. Updated `package.json` Scripts
**Before:**
```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "prisma generate && tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  ...
}
```

**After:**
```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "prisma generate && tsc",
  "postinstall": "prisma generate",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  ...
}
```

---

## Environment Variables Required

The following environment variables must be set in Vercel Dashboard:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `FRONTEND_URL` | Frontend URL for CORS configuration |

---

## API Endpoints

After successful deployment, the following endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info and available endpoints |
| GET | `/health` | Health check endpoint |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user (protected) |
| GET | `/api/tutors` | Get all tutors |
| GET | `/api/tutors/:id` | Get tutor by ID |
| GET | `/api/categories` | Get all categories |
| GET | `/api/bookings` | Get user bookings (protected) |
| POST | `/api/bookings` | Create booking (protected) |
| GET | `/api/reviews` | Get reviews |
| GET | `/api/admin/users` | Get all users (admin only) |
| GET | `/api/admin/stats` | Get dashboard stats (admin only) |

---

## Lessons Learned

1. **Vercel Serverless Functions** require TypeScript source files, not compiled JavaScript
2. **Prisma on Vercel** needs `postinstall` script to generate the client
3. **Express apps on Vercel** need to export the app for serverless functions
4. **Environment detection** using `process.env.VERCEL` helps differentiate between local and serverless environments

---

## Deployment Checklist

- [x] Initialize git repository
- [x] Create meaningful commits (16 commits)
- [x] Push to GitHub
- [x] Create Vercel project
- [x] Configure `vercel.json`
- [x] Create serverless entry point (`api/index.ts`)
- [x] Update `server.ts` for serverless compatibility
- [x] Add `postinstall` script for Prisma
- [x] Set environment variables in Vercel
- [x] Deploy and test

---

**Report Generated:** February 21, 2026