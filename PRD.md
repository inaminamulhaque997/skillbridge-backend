I'll create a comprehensive Product Requirements Document (PRD) for your SkillBridge backend. This will be detailed enough for vibe coding with an AI assistant.

---

# **SKILLBRIDGE BACKEND - PRODUCT REQUIREMENTS DOCUMENT (PRD)**

**Version:** 1.0  
**Date:** February 2026  
**Status:** Ready for Development  
**Target:** Node.js + Express + PostgreSQL + Prisma

---

## **1. EXECUTIVE SUMMARY**

Build a REST API backend for SkillBridge - a tutor marketplace platform. The backend must support three user roles (Student, Tutor, Admin), handle bookings, reviews, and availability management. All endpoints must include proper authentication, validation, and error handling.

---

## **2. TECH STACK REQUIREMENTS**

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 20.x | JavaScript runtime |
| Framework | Express.js | 4.x | Web framework |
| Database | PostgreSQL | 15+ | Primary database |
| ORM | Prisma | 6.x | Database access |
| Auth | JWT (jsonwebtoken) | 9.x | Token-based auth |
| Password Hash | bcryptjs | 2.x | Password encryption |
| Validation | Zod | 3.x | Schema validation |
| CORS | cors | 2.x | Cross-origin requests |
| Environment | dotenv | 16.x | Config management |

---

## **3. DATABASE SCHEMA (PRISMA)**

### **3.1 Complete Schema Definition**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== CORE TABLES ====================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // hashed with bcrypt
  name      String
  role      Role     @default(STUDENT)
  avatar    String?
  phone     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  studentBookings Booking[] @relation("StudentBookings")
  tutorBookings   Booking[] @relation("TutorBookings")
  tutorProfile    TutorProfile?
  reviewsWritten  Review[]  @relation("ReviewAuthor")
  availability    Availability[]
  
  @@map("users")
}

model TutorProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  bio         String   @db.Text
  hourlyRate  Decimal  @db.Decimal(10, 2)
  education   String?
  experience  String?
  subjects    String[] // Array of subject names
  languages   String[] @default(["English"])
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("tutor_profiles")
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  icon        String?
  createdAt   DateTime @default(now())
  
  @@map("categories")
}

// ==================== BOOKING SYSTEM ====================

model Booking {
  id          String        @id @default(uuid())
  studentId   String
  tutorId     String
  date        DateTime      @db.Date
  startTime   String        // Format: "HH:mm" (24-hour)
  endTime     String        // Format: "HH:mm" (24-hour)
  status      BookingStatus @default(PENDING)
  price       Decimal       @db.Decimal(10, 2)
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  student     User          @relation("StudentBookings", fields: [studentId], references: [id])
  tutor       User          @relation("TutorBookings", fields: [tutorId], references: [id])
  review      Review?
  
  @@map("bookings")
}

model Availability {
  id        String @id @default(uuid())
  tutorId   String
  dayOfWeek Int    // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime String // "HH:mm"
  endTime   String // "HH:mm"
  isActive  Boolean @default(true)
  
  tutor     User   @relation(fields: [tutorId], references: [id], onDelete: Cascade)
  
  @@unique([tutorId, dayOfWeek, startTime])
  @@map("availability")
}

model Review {
  id        String   @id @default(uuid())
  bookingId String   @unique
  studentId String
  tutorId   String
  rating    Int      // 1-5
  comment   String?  @db.Text
  createdAt DateTime @default(now())
  
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  author    User     @relation("ReviewAuthor", fields: [studentId], references: [id])
  
  @@map("reviews")
}

// ==================== ENUMS ====================

enum Role {
  STUDENT
  TUTOR
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

---

## **4. API ENDPOINTS SPECIFICATION**

### **4.1 AUTHENTICATION ROUTES** (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |

**Request/Response Examples:**

**POST /api/auth/register**
```json
// Request Body (Zod Schema)
{
  "email": "string@email.com",      // email, required
  "password": "string",              // min 6 chars, required
  "name": "string",                  // min 2 chars, required
  "role": "STUDENT" | "TUTOR"       // enum, required
}

// Success Response 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "STUDENT",
      "createdAt": "2026-01-01T00:00:00Z"
    },
    "token": "jwt_token_string"
  }
}

// Error Response 400
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

**POST /api/auth/login**
```json
// Request Body
{
  "email": "string",
  "password": "string"
}

// Success Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object without password */ },
    "token": "jwt_token_string"
  }
}

// Error Response 401
{
  "success": false,
  "message": "Invalid credentials"
}
```

**GET /api/auth/me**
```json
// Headers: Authorization: Bearer <token>

// Success Response 200
{
  "success": true,
  "data": {
    "user": { /* full user object */ }
  }
}
```

---

### **4.2 PUBLIC TUTOR ROUTES** (`/api/tutors`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all tutors with filters | No |
| GET | `/:id` | Get single tutor details | No |
| GET | `/:id/availability` | Get tutor availability | No |

**GET /api/tutors** - Query Parameters:
```
?subject=Math&minPrice=20&maxPrice=100&minRating=4&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tutors": [
      {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "url",
        "role": "TUTOR",
        "tutorProfile": {
          "bio": "Experienced math tutor",
          "hourlyRate": 50.00,
          "subjects": ["Math", "Physics"],
          "education": "PhD Mathematics"
        },
        "averageRating": 4.8,
        "totalReviews": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

**GET /api/tutors/:id**
```json
{
  "success": true,
  "data": {
    "tutor": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "avatar": "string",
      "tutorProfile": { /* full profile */ },
      "availability": [/* weekly schedule */],
      "reviews": [
        {
          "id": "uuid",
          "rating": 5,
          "comment": "Great tutor!",
          "author": { "name": "Student Name" },
          "createdAt": "date"
        }
      ],
      "averageRating": 4.5,
      "totalReviews": 10
    }
  }
}
```

---

### **4.3 CATEGORY ROUTES** (`/api/categories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all categories | No |

---

### **4.4 BOOKING ROUTES** (`/api/bookings`) - PROTECTED

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Create booking | Student |
| GET | `/` | Get my bookings | Student/Tutor |
| GET | `/:id` | Get booking details | Student/Tutor (owner only) |
| PATCH | `/:id/status` | Update booking status | Tutor/Admin |
| PATCH | `/:id/cancel` | Cancel booking | Student (own booking) |

**POST /api/bookings**
```json
// Request Body (Student only)
{
  "tutorId": "uuid",
  "date": "2026-02-20",           // ISO date, must be future
  "startTime": "14:00",           // "HH:mm", must be in tutor availability
  "endTime": "15:00",
  "notes": "Need help with calculus"
}

// Business Logic:
// 1. Verify tutor exists and is active
// 2. Check tutor availability for that day/time
// 3. Check no conflicting bookings
// 4. Calculate price from tutorProfile.hourlyRate * duration
// 5. Create booking with status PENDING
```

**GET /api/bookings** - Query params: `?status=UPCOMING&page=1`
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "date": "2026-02-20",
        "startTime": "14:00",
        "endTime": "15:00",
        "status": "CONFIRMED",
        "price": 50.00,
        "tutor": { "name": "...", "avatar": "..." },
        "student": { "name": "...", "avatar": "..." },
        "canReview": false // true if completed and no review exists
      }
    ]
  }
}
```

---

### **4.5 TUTOR MANAGEMENT ROUTES** (`/api/tutor`) - TUTOR ONLY

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get my tutor profile |
| PUT | `/profile` | Update tutor profile |
| GET | `/availability` | Get my availability |
| PUT | `/availability` | Set/update availability |
| GET | `/sessions` | Get my teaching sessions |

**PUT /api/tutor/profile**
```json
// Request Body
{
  "bio": "Updated bio",
  "hourlyRate": 60.00,
  "subjects": ["Math", "Chemistry"],
  "education": "MSc Mathematics",
  "experience": "5 years teaching"
}
```

**PUT /api/tutor/availability** - Replaces all availability
```json
// Request Body - Array of slots for each day
{
  "availability": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "12:00" },
    { "dayOfWeek": 1, "startTime": "14:00", "endTime": "17:00" },
    { "dayOfWeek": 3, "startTime": "10:00", "endTime": "15:00" }
  ]
}
// Validation: No overlapping time slots per day
```

---

### **4.6 REVIEW ROUTES** (`/api/reviews`) - STUDENT ONLY

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create review |

**POST /api/reviews**
```json
// Request Body
{
  "bookingId": "uuid",
  "rating": 5,        // 1-5 integer
  "comment": "Excellent session!"
}

// Business Rules:
// 1. Must be the student who booked
// 2. Booking status must be COMPLETED
// 3. No existing review for this booking
// 4. Update tutor's average rating
```

---

### **4.7 ADMIN ROUTES** (`/api/admin`) - ADMIN ONLY

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| PATCH | `/users/:id` | Update user (ban/unban, change role) |
| GET | `/bookings` | View all bookings |
| GET | `/stats` | Platform statistics |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

**GET /api/admin/users** - Query: `?role=TUTOR&isActive=true&page=1`
```json
{
  "success": true,
  "data": {
    "users": [/* full user list */],
    "pagination": { /* pagination info */ }
  }
}
```

**PATCH /api/admin/users/:id**
```json
// Request Body
{
  "isActive": false,  // Ban user
  "role": "TUTOR"     // Change role
}
```

**GET /api/admin/stats**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalStudents": 100,
    "totalTutors": 45,
    "totalBookings": 300,
    "pendingBookings": 20,
    "completedBookings": 250,
    "cancelledBookings": 30,
    "totalRevenue": 15000.00
  }
}
```

---

## **5. AUTHENTICATION & AUTHORIZATION**

### **5.1 JWT Implementation**

```typescript
// Token Payload
{
  "userId": "uuid",
  "email": "user@email.com",
  "role": "STUDENT",
  "iat": 1704067200,
  "exp": 1706659200  // 30 days
}

// Middleware Logic:
// 1. Extract token from Authorization: Bearer <token>
// 2. Verify JWT with JWT_SECRET
// 3. Check user exists and isActive=true
// 4. Attach user to request object
// 5. For role-specific routes, check req.user.role
```

### **5.2 Role-Based Access Matrix**

| Endpoint | Public | Student | Tutor | Admin |
|----------|--------|---------|-------|-------|
| Auth routes | ✅ | ✅ | ✅ | ✅ |
| Browse tutors | ✅ | ✅ | ✅ | ✅ |
| Create booking | ❌ | ✅ | ❌ | ❌ |
| View own bookings | ❌ | ✅ | ✅ | ❌ |
| Manage tutor profile | ❌ | ❌ | ✅ | ❌ |
| Set availability | ❌ | ❌ | ✅ | ❌ |
| Create review | ❌ | ✅ | ❌ | ❌ |
| Admin dashboard | ❌ | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ✅ |

---

## **6. VALIDATION SCHEMAS (ZOD)**

### **6.1 Auth Validations**

```typescript
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["STUDENT", "TUTOR"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});
```

### **6.2 Booking Validations**

```typescript
const createBookingSchema = z.object({
  tutorId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  notes: z.string().max(500).optional()
}).refine(data => {
  // Validate endTime > startTime
  return data.endTime > data.startTime;
}, { message: "End time must be after start time" });
```

### **6.3 Review Validations**

```typescript
const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});
```

---

## **7. ERROR HANDLING SPECIFICATION**

### **7.1 Error Response Format**

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",           // Optional: for frontend i18n
  "errors": [                     // Optional: validation details
    { "field": "email", "message": "Already exists" }
  ]
}
```

### **7.2 HTTP Status Codes**

| Code | Usage |
|------|-------|
| 200 | GET success |
| 201 | POST/PUT success (created) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, booking conflict) |
| 500 | Server error |

### **7.3 Error Types to Handle**

- `ValidationError` - Zod validation failures
- `AuthenticationError` - Invalid/missing JWT
- `AuthorizationError` - Insufficient permissions
- `NotFoundError` - Resource doesn't exist
- `ConflictError` - Booking time conflict, duplicate email
- `DatabaseError` - Prisma errors (wrap in generic message)

---

## **8. BUSINESS LOGIC REQUIREMENTS**

### **8.1 Booking Flow**

```
1. Student creates booking (status: PENDING)
   ↓
2. System checks:
   - Tutor is active
   - Date is in future
   - Time slot is in tutor's availability
   - No overlapping bookings for tutor
   ↓
3. Booking created with calculated price
   ↓
4. Tutor can CONFIRM or CANCEL
   ↓
5. After session, Tutor marks COMPLETED
   ↓
6. Student can leave review (once)
```

### **8.2 Availability Logic**

- Tutor sets weekly recurring availability (e.g., Mon 9-12, Wed 14-17)
- System validates no overlapping slots per day
- When student books, system checks:
  - Day of week matches availability
  - Time range fits within availability slot
  - No existing booking overlaps

### **8.3 Review Logic**

- Only students who completed a session can review
- One review per booking maximum
- Rating affects tutor's averageRating (cached on profile)

---

## **9. SEED DATA REQUIREMENTS**

### **9.1 Mandatory Admin Account**

```javascript
{
  email: "admin@skillbridge.com",
  password: "admin123",  // bcrypt hashed
  name: "Platform Admin",
  role: "ADMIN",
  isActive: true
}
```

### **9.2 Sample Data (Optional but Recommended)**

- 5-10 sample tutors with profiles
- 3-5 categories (Math, Science, Programming, Languages, Music)
- 10-15 sample bookings in various statuses
- 5-8 sample reviews

---

## **10. PROJECT STRUCTURE**

```
skillbridge-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   │   ├── database.ts      # Prisma client export
│   │   └── auth.ts          # JWT config
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── tutor.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── review.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── role.middleware.ts      # Role checking
│   │   ├── error.middleware.ts     # Global error handler
│   │   └── validate.middleware.ts  # Zod validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── tutor.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── review.routes.ts
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── tutor.service.ts
│   │   ├── booking.service.ts
│   │   └── admin.service.ts
│   ├── utils/
│   │   ├── asyncHandler.ts   # Catch async errors
│   │   ├── ApiError.ts       # Custom error class
│   │   └── ApiResponse.ts    # Standard response format
│   ├── types/
│   │   └── express.d.ts      # Type extensions
│   └── app.ts                # Express app setup
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── server.ts                 # Entry point
```

---

## **11. ENVIRONMENT VARIABLES**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_EXPIRES_IN="30d"

# CORS
FRONTEND_URL="http://localhost:3000"
```

---

## **12. DEPLOYMENT CHECKLIST**

### **12.1 Pre-Deployment**

- [ ] All environment variables set
- [ ] Database migrated: `prisma migrate deploy`
- [ ] Admin account seeded
- [ ] CORS configured for frontend domain
- [ ] Error handling doesn't expose stack traces
- [ ] JWT secret is strong and unique

### **12.2 Deployment Options**

| Platform | Best For | Notes |
|----------|----------|-------|
| **Render** | Free tier, easy | Web Service + PostgreSQL |
| **Railway** | Simple hosting | Good free tier |
| **Vercel** | Serverless | May need API routes config |
| **AWS/Heroku** | Production | More complex setup |

### **12.3 Post-Deployment Verification**

- [ ] Health check endpoint responds: `GET /health` → `{"status":"ok"}`
- [ ] Admin login works with provided credentials
- [ ] CORS allows frontend requests
- [ ] Database connections stable

---

## **13. ACCEPTANCE CRITERIA**

### **13.1 Functional Requirements**

- [ ] Student can register, login, browse tutors, book sessions
- [ ] Tutor can set profile, availability, view sessions
- [ ] Admin can manage users, view all bookings, see stats
- [ ] All CRUD operations work via API
- [ ] Role-based access control enforced
- [ ] Input validation on all endpoints
- [ ] Proper error messages returned

### **13.2 Non-Functional Requirements**

- [ ] API response time < 500ms for standard queries
- [ ] 99% uptime during testing
- [ ] Secure password storage (bcrypt)
- [ ] JWT tokens expire after 30 days
- [ ] SQL injection prevented via Prisma
- [ ] XSS protection via input sanitization

---

## **14. FRONTEND INTEGRATION NOTES**

### **14.1 Base URL Configuration**

```typescript
// Frontend .env.local
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### **14.2 API Client Setup**

```typescript
// Helper for authenticated requests
const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });
    
    if (res.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    
    return res.json();
  }
};
```

### **14.3 Replacing Mock Services**

Replace these frontend mock files with real API calls:
- `services/auth.ts` → Real auth endpoints
- `services/booking.ts` → Real booking endpoints
- `services/admin.ts` → Real admin endpoints

---

## **15. DELIVERABLES**

| Item | Format | Required |
|------|--------|----------|
| Backend Source Code | GitHub Repo | ✅ |
| API Documentation | README.md | ✅ |
| Admin Credentials | Text file | ✅ |
| Live API URL | HTTPS URL | ✅ |
| Database Schema | prisma/schema.prisma | ✅ |
| Environment Template | .env.example | ✅ |

---

**END OF PRD**

---

This PRD is ready to feed into any AI coding assistant. It includes:

✅ **Complete database schema** with all relations  
✅ **Every API endpoint** with request/response examples  
✅ **Zod validation schemas** for input validation  
✅ **Authentication rules** and role-based access  
✅ **Business logic** for bookings and availability  
✅ **Error handling** specifications  
✅ **Project structure** and file organization  

