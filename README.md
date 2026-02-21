# SkillBridge Backend

A robust backend API for the SkillBridge tutoring platform, built with Node.js, Express, TypeScript, and Prisma.

## 🌐 Live Deployment

**Backend API:** https://skillbridge-backend-sigma.vercel.app/

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **User Management** - Students, Tutors, and Admins
- **Tutor Profiles** - Manage tutor profiles, subjects, and availability
- **Booking System** - Session booking with availability checking
- **Reviews & Ratings** - Student reviews for tutors
- **Admin Dashboard** - Platform management and analytics

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** JWT + HTTP-only cookies
- **Validation:** Zod
- **Deployment:** Vercel

## 📁 Project Structure

```
skillbridge-backend/
├── api/
│   └── index.ts          # Vercel serverless entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth, validation, error handling
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── validations/      # Zod schemas
└── package.json
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Tutors
- `GET /api/tutors` - List all tutors
- `GET /api/tutors/:id` - Get tutor details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/tutor/:id` - Get tutor reviews

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/status` - Update user status

## 🗄️ Database Models

- **User** - Students, Tutors, Admins
- **TutorProfile** - Tutor-specific information
- **Availability** - Tutor availability slots
- **Booking** - Session bookings
- **Review** - Tutor reviews
- **Category** - Subject categories

