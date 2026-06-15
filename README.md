# Beach Resort — Hotel Room Booking System

A comprehensive full-stack hotel room booking and management system built with modern web technologies. The application provides a complete solution for hotel room reservations, user management, and administrative operations.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Default Credentials](#default-credentials)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## Features

### Authentication & Authorization

- User Registration and Login with email verification
- JWT-based authentication with access and refresh tokens
- Password reset functionality with secure token system
- Role-based access control (Admin / User)
- Account status management (Active / Blocked / Verified)

### Room Management

- Room CRUD operations with image uploads
- Room categorization — Single, Couple, Family, Presidential
- Room status tracking — Available, Unavailable, Booked
- Featured rooms highlighting
- Advanced room filtering and search
- Room capacity and pricing management

### Booking System

- Date-based booking with validation
- Booking status management — Pending, Approved, Cancelled, Rejected, Completed
- Booking history for users
- Admin booking management panel
- Automatic room status updates

### Review System

- Room reviews and ratings (1–5 stars)
- User review management
- Review editing and deletion
- Average rating calculations

### User Management

- User profile management with avatar uploads
- Admin dashboard with comprehensive statistics
- User role management
- Account blocking and unblocking

### Admin Dashboard

- Real-time statistics (Users, Rooms, Bookings)
- Data visualization with charts and animated counters
- User and booking management
- Room inventory management

---

## Technology Stack

### Backend

| Technology           | Purpose                        |
| -------------------- | ------------------------------ |
| Node.js              | Runtime environment            |
| Express.js           | Web framework                  |
| PostgreSQL           | Relational database            |
| Prisma               | Database ORM and query builder |
| JWT                  | Authentication tokens          |
| Bcrypt.js            | Password hashing               |
| Multer               | File upload handling           |
| SendGrid             | Email service                  |
| Winston              | Logging                        |
| Morgan               | HTTP request logging           |
| Helmet               | Security headers               |
| CORS                 | Cross-origin resource sharing  |
| Express Rate Limit   | API rate limiting              |

### Frontend (Client)

| Technology        | Purpose                     |
| ----------------- | --------------------------- |
| Next.js 13        | React framework with SSR    |
| React 18          | UI library                  |
| Redux Toolkit     | State management            |
| Ant Design        | UI component library        |
| Styled Components | CSS-in-JS styling           |
| Axios             | HTTP client                 |
| Day.js            | Date manipulation           |
| React Icons       | Icon components             |

### Admin Panel

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| React 18         | UI library                      |
| Redux Toolkit    | State management                |
| Ant Design       | UI component library            |
| Tailwind CSS     | Utility-first CSS framework     |
| React Router Dom | Client-side routing             |
| React CountUp    | Animated counters               |
| JWT Decode       | Token decoding                  |

---

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │    Backend      │
│   (Next.js)     │    │   (React.js)    │    │   (Node.js)     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • Admin Dashboard│   │ • REST API      │
│ • Room Booking  │◄──►│ • Management    │◄──►│ • Authentication│
│ • User Profile  │    │ • Analytics     │    │ • Business Logic│
│ • Reviews       │    │ • CRUD Operations│   │ • File Upload   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (via Prisma)  │
                                               │ • Users         │
                                               │ • Rooms         │
                                               │ • Bookings      │
                                               │ • Reviews       │
                                               └─────────────────┘
```

---

## Database Schema

### User Model

| Field      | Type                                          |
| ---------- | --------------------------------------------- |
| userName   | String (unique)                               |
| fullName   | String                                        |
| email      | String (unique)                               |
| phone      | String                                        |
| password   | String (hashed)                               |
| avatar     | String                                        |
| gender     | Enum — male, female                           |
| dob        | Date                                          |
| address    | String                                        |
| role       | Enum — admin, user                            |
| verified   | Boolean                                       |
| status     | Enum — register, login, logout, blocked       |

### Room Model

| Field            | Type                                              |
| ---------------- | ------------------------------------------------- |
| room_name        | String (unique)                                   |
| room_slug        | String (unique)                                   |
| room_type        | Enum — single, couple, family, presidential       |
| room_price       | Float                                             |
| room_size        | Float                                             |
| room_capacity    | Integer                                           |
| allow_pets       | Boolean                                           |
| provide_breakfast| Boolean                                           |
| featured_room    | Boolean                                           |
| room_description | String                                            |
| extra_facilities | String[]                                          |
| room_status      | Enum — available, unavailable, booked             |
| created_by       | UUID (ref: Users)                                 |

### Booking Model

| Field          | Type                                                              |
| -------------- | ----------------------------------------------------------------- |
| room_id        | UUID (ref: Rooms)                                                 |
| booking_dates  | DateTime[]                                                        |
| booking_status | Enum — pending, cancel, approved, rejected, in-reviews, completed |
| booking_by     | UUID (ref: Users)                                                 |

### Review Model

| Field      | Type                |
| ---------- | ------------------- |
| user_id    | UUID (ref: Users)   |
| room_id    | UUID (ref: Rooms)   |
| booking_id | UUID (ref: Bookings)|
| rating     | Integer (1–5)       |
| message    | String              |

---

## Default Credentials

After running the seed script, the following accounts are available:

### Admin Account

| Field    | Value              |
| -------- | ------------------ |
| Email    | Prabhjot@gmail.com |
| Password | Prince123          |
| Username | prabhjot           |
| Role     | admin              |

### Regular User Account

| Field    | Value            |
| -------- | ---------------- |
| Email    | Vansh@gmail.com  |
| Password | Vansh123         |
| Username | vansh            |
| Role     | user             |

### Additional Test Users

| Name    | Email              | Password |
| ------- | ------------------ | -------- |
| Shruti  | Shruti@gmail.com   | user123  |
| Kumkum  | Kumkum@gmail.com   | user123  |
| Supriya | Supriya@gmail.com  | user123  |
| Aftab   | Aftab@gmail.com    | user123  |

### Database Connection

| Field       | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| Database URL| postgresql://postgres:postgres123@localhost:5002/hotel_booking_db |
| DB User     | postgres                                                   |
| DB Password | postgres123                                                |
| Port        | 5002                                                       |

---

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/Prabhjot-ctrl/Beach-resort.git
cd Beach-resort
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# APPLICATION
APP_NAME = Hotel-Room-Booking-System
APP_PORT = 3033
APP_NODE_ENV = development
APP_BASE_URL = http://localhost:3033
APP_SERVICE_URL = http://localhost:3033
APP_LOG_LEVEL = info

# DATABASE
DATABASE_URL = postgresql://postgres:postgres123@localhost:5002/hotel_booking_db

# JWT
JWT_SECRET_KEY = your_jwt_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES = 1d
JWT_REFRESH_TOKEN_EXPIRES = 7d
JWT_TOKEN_COOKIE_EXPIRES = 7
JWT_REFRESH_TOKEN_SECRET_KEY = your_jwt_refresh_secret_key_here

# EMAIL (SendGrid)
SEND_SENDER_MAIL =
SEND_GRID_API_KEY =
```

Run Prisma migrations and seed the database:

```bash
npx prisma migrate dev
node src/scripts/seed-sample-data.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
API_BASE_URL = 'http://localhost:3033'
```

### 4. Admin Panel Setup

```bash
cd admin-panel
npm install
```

Create a `.env` file in the `admin-panel` directory:

```env
REACT_APP_API_BASE_URL = http://localhost:3033
```

### 5. Start the Applications

Start all three applications in separate terminals:

```bash
# Terminal 1 — Backend (http://localhost:3033)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:3034)
cd frontend
npm run dev

# Terminal 3 — Admin Panel (http://localhost:3033)
cd admin-panel
npm start
```

---

## API Documentation

### Authentication Routes

| Method | Endpoint                              | Description          |
| ------ | ------------------------------------- | -------------------- |
| POST   | /api/v1/auth/registration             | User registration    |
| POST   | /api/v1/auth/login                    | User login           |
| POST   | /api/v1/auth/logout                   | User logout          |
| POST   | /api/v1/auth/forgot-password          | Request password reset |
| POST   | /api/v1/auth/reset-password/:token    | Reset password       |
| POST   | /api/v1/auth/change-password          | Change password      |
| POST   | /api/v1/auth/verify-email/:token      | Verify email         |
| GET    | /api/v1/auth/refresh-token            | Refresh JWT token    |

### Room Routes

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | /api/v1/all-rooms-list                    | Get all rooms            |
| GET    | /api/v1/get-room-by-id-or-slug-name/:id   | Get room details         |
| GET    | /api/v1/featured-rooms-list               | Get featured rooms       |
| POST   | /api/v1/create-room                       | Create room (Admin)      |
| PUT    | /api/v1/edit-room/:id                     | Edit room (Admin)        |
| DELETE | /api/v1/delete-room/:id                   | Delete room (Admin)      |

### Booking Routes

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| POST   | /api/v1/placed-booking-order/:id      | Place booking order       |
| GET    | /api/v1/get-user-booking-orders       | Get user bookings         |
| PUT    | /api/v1/cancel-booking-order/:id      | Cancel booking            |
| GET    | /api/v1/get-all-booking-orders        | Get all bookings (Admin)  |
| PUT    | /api/v1/updated-booking-order/:id     | Update booking (Admin)    |

### User Routes

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| GET    | /api/v1/get-user                | Get current user           |
| GET    | /api/v1/get-user/:id            | Get user by ID (Admin)     |
| PUT    | /api/v1/update-user             | Update user profile        |
| PUT    | /api/v1/avatar-update           | Update user avatar         |
| DELETE | /api/v1/delete-user             | Delete current user        |
| DELETE | /api/v1/delete-user/:id         | Delete user by ID (Admin)  |
| GET    | /api/v1/all-users-list          | Get all users (Admin)      |
| PUT    | /api/v1/blocked-user/:id        | Block user (Admin)         |
| PUT    | /api/v1/unblocked-user/:id      | Unblock user (Admin)       |

### Review Routes

| Method | Endpoint                                  | Description      |
| ------ | ----------------------------------------- | ---------------- |
| POST   | /api/v1/room-review-add/:id               | Add room review  |
| GET    | /api/v1/get-room-reviews-list/:room_id    | Get room reviews |
| PUT    | /api/v1/edit-room-review/:review_id       | Edit review      |

---

## Project Structure

```
Hotel-Room-Booking-System/
├── backend/
│   ├── prisma/              # Database schema and migrations
│   ├── src/
│   │   ├── app/             # Express app configuration
│   │   ├── configs/         # Application configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── database/        # Database connection
│   │   ├── lib/             # Utility libraries
│   │   ├── middleware/      # Auth, error handling, upload middleware
│   │   ├── models/          # Prisma model helpers
│   │   ├── routes/          # API route definitions
│   │   ├── scripts/         # Seed scripts
│   │   └── services/        # Business logic services
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── components/          # React components
│   ├── data/                # Static data
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Next.js pages
│   ├── store/               # Redux store and slices
│   ├── styles/              # Global styles
│   ├── utils/               # Helper utilities
│   └── package.json
│
├── admin-panel/
│   ├── src/                 # React source code
│   ├── public/              # Static assets
│   ├── tailwind.config.js   # Tailwind configuration
│   └── package.json
│
└── README.md
```

---

## Security Features

- JWT Authentication with access and refresh tokens
- Password hashing using bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests
- Helmet for security headers
- File upload restrictions and validation
- Environment variable protection

## Responsive Design

All applications are fully responsive and optimized for desktop computers, tablets, mobile devices, and various screen sizes.

---

**Author:** Prabhjot Saini
