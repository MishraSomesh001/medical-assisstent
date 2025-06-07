# Email/Password Authentication Setup

## Overview
This project uses NextAuth.js with email/password authentication and MongoDB for user storage.

## Features
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Protected Routes
- ✅ Session Management
- ✅ Password Hashing (bcrypt)
- ✅ Form Validation
- ✅ Error Handling
- ✅ Responsive UI

## Environment Variables
Make sure your `.env.local` file contains:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secure_random_secret
NODE_ENV=development
```

## How to Generate NEXTAUTH_SECRET
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Routes
- `/` - Home page (public)
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/error` - Authentication error page
- `/dashboard` - Protected dashboard (requires authentication)

## API Endpoints
- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/auth/signup` - User registration

## Database Schema
Users are stored in MongoDB with this structure:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  role: String (default: "user"),
  createdAt: Date,
  emailVerified: Date | null
}
```

## Usage

### 1. Start the development server
```bash
npm run dev
```

### 2. Create an account
- Go to `/auth/signup`
- Fill in name, email, and password
- Click "Create account"

### 3. Sign in
- Go to `/auth/signin`
- Enter your email and password
- Click "Sign in"

### 4. Access protected content
- After signing in, you'll be redirected to `/dashboard`
- The dashboard shows your user information and available features

## Security Features
- Passwords are hashed using bcrypt with salt rounds of 12
- JWT sessions with secure configuration
- Protected routes with middleware
- Input validation on both client and server
- CSRF protection (built into NextAuth.js)

## Customization
You can customize the authentication by:
- Modifying the UI components in `/components/`
- Adding more fields to the user schema
- Implementing email verification
- Adding password reset functionality
- Customizing the session duration

## Troubleshooting

### Common Issues:
1. **MongoDB Connection**: Ensure your MONGODB_URI is correct
2. **NEXTAUTH_SECRET**: Make sure it's set and secure
3. **Environment Variables**: Check that all required env vars are set
4. **Port Conflicts**: Ensure port 3000 is available

### Debug Mode:
The authentication system runs in debug mode during development, check the console for detailed logs.