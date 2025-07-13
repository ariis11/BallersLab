# BallersLab Backend API

A Node.js/Express backend with JWT authentication, PostgreSQL database, and Prisma ORM.

## Features

- 🔐 JWT-based authentication
- 👤 Simple user registration (email + password only)
- 📝 Profile completion flow after registration
- 🛡️ Password hashing with bcrypt
- 📊 PostgreSQL database with Prisma ORM
- ✅ Input validation with Joi
- 🚀 Rate limiting and security headers
- 📝 Session management
- 🔄 Profile management

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # CORS
   CORS_ORIGIN="http://localhost:3000,http://localhost:8081"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations (recommended for production)
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (email + password only)
- `POST /api/auth/complete-profile` - Complete user profile after registration
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires auth)
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Health Check

- `GET /health` - Server health status

## Request/Response Examples

### Register User (Simple)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User registered successfully. Please complete your profile.",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "profileCompleted": false,
    "profile": null
  },
  "token": "...",
  "requiresProfileCompletion": true
}
```

### Complete Profile
```bash
POST /api/auth/complete-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "bio": "Software developer",
  "phone": "+1234567890",
  "location": "New York, NY"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "profileCompleted": true,
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "bio": "Software developer"
    }
  },
  "token": "...",
  "requiresProfileCompletion": false
}
```

### Update Profile
```bash
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "username": "johnsmith",
  "bio": "Updated bio"
}
```

## Database Schema

### Users Table
- `id` - Unique identifier (CUID)
- `email` - User email (unique)
- `password` - Hashed password
- `isActive` - Account status
- `isVerified` - Email verification status
- `profileCompleted` - Whether user has completed profile setup
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Profiles Table
- `id` - Profile identifier
- `userId` - User ID (foreign key, unique)
- `firstName` - First name
- `lastName` - Last name
- `username` - Username (unique, optional)
- `avatar` - Avatar URL (optional)
- `bio` - User bio (optional)
- `phone` - Phone number (optional)
- `dateOfBirth` - Date of birth (optional)
- `location` - Location (optional)
- `website` - Website URL (optional)
- `createdAt` - Profile creation timestamp
- `updatedAt` - Last update timestamp

### Sessions Table
- `id` - Session identifier
- `userId` - User ID (foreign key)
- `token` - JWT token (unique)
- `expiresAt` - Token expiration date
- `createdAt` - Session creation timestamp
- `updatedAt` - Last update timestamp

## User Flow

1. **Registration**: User provides only email and password
2. **Profile Completion**: After registration, user is prompted to complete their profile
3. **Login**: User can login with email/password, system checks if profile is complete
4. **Profile Management**: Users can update their profile information anytime

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token expiration (7 days)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Joi
- Session-based token management

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Create a new migration
npx prisma migrate dev --name add_new_field

# Reset database (development only)
npx prisma migrate reset
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000,http://localhost:8081` |

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `404` - Not Found
- `500` - Internal Server Error 