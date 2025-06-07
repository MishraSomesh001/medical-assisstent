# Authentication System Documentation

## Overview

This project uses NextAuth.js for authentication with a modular, clean architecture. The system supports multiple OAuth providers (Google, GitHub) and uses MongoDB for session storage.

## Architecture

### Core Components

1. **Configuration** (`lib/auth.config.ts`)
   - Centralized NextAuth configuration
   - Provider setup
   - Session and callback configuration

2. **Utilities** (`lib/auth.utils.ts`)
   - Server-side authentication helpers
   - Session management utilities
   - Permission checking functions

3. **Components** (`components/auth/`)
   - `AuthButton.tsx`: Reusable sign-in/sign-out buttons
   - `AuthGuard.tsx`: Route protection component
   - `AuthShowcase.js`: Main authentication UI

4. **Hooks** (`hooks/useAuth.ts`)
   - Client-side authentication hooks
   - Redirect management
   - Authentication state management

5. **Middleware** (`middleware.ts`)
   - Route protection
   - Automatic redirects
   - Role-based access control

## Setup Instructions

### 1. Environment Variables

Copy the `.env.local` file and fill in your OAuth credentials:

```env
# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth (Get from GitHub Developer Settings)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here_make_it_long_and_secure
```

### 2. OAuth Provider Setup

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth Setup:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 3. MongoDB Setup

The system uses MongoDB with the NextAuth MongoDB adapter for session storage. Make sure your MongoDB instance is running and accessible.

## Usage Examples

### Basic Authentication Check

```tsx
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Access Denied</p>;

  return <p>Welcome {session.user.email}!</p>;
}
```

### Server-side Authentication

```tsx
import { getAuthSession } from "../lib/auth.utils";

export default async function ProtectedPage() {
  const session = await getAuthSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Protected content</div>;
}
```

### Using Auth Guard

```tsx
import AuthGuard from "../components/auth/AuthGuard";

function ProtectedComponent() {
  return (
    <AuthGuard>
      <div>This content is protected</div>
    </AuthGuard>
  );
}
```

### Custom Hooks

```tsx
import { useRequireAuth } from "../hooks/useAuth";

function MyProtectedComponent() {
  const { session, isLoading } = useRequireAuth();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome {session.user.name}!</div>;
}
```

## Route Protection

### Automatic Protection (Middleware)

The middleware automatically protects routes based on patterns:

- `/dashboard/*` - Requires authentication
- `/profile/*` - Requires authentication  
- `/admin/*` - Requires admin role
- `/auth/*` - Redirects authenticated users

### Manual Protection (Components)

Use `AuthGuard` component for granular control:

```tsx
<AuthGuard requiredRole="admin" redirectTo="/unauthorized">
  <AdminPanel />
</AuthGuard>
```

## Available Routes

- `/` - Public home page
- `/auth/signin` - Sign-in page
- `/auth/error` - Authentication error page
- `/dashboard` - Protected dashboard (requires auth)
- `/unauthorized` - Access denied page

## Session Management

### Session Strategy

The system uses database sessions (not JWT) for better security and session management:

```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Session Callbacks

Custom session callbacks add user ID and role to the session:

```typescript
callbacks: {
  async session({ session, user }) {
    if (session.user) {
      session.user.id = user.id;
      session.user.role = user.role;
    }
    return session;
  },
}
```

## Security Features

1. **CSRF Protection**: Built-in NextAuth CSRF protection
2. **Secure Cookies**: HTTPOnly, Secure, SameSite cookies
3. **Session Validation**: Server-side session validation
4. **Route Protection**: Middleware-based route protection
5. **Role-based Access**: Support for user roles and permissions

## Error Handling

The system includes comprehensive error handling:

- Authentication errors are displayed on `/auth/error`
- Network errors are handled gracefully
- Loading states are managed consistently
- Fallback UI for unauthenticated states

## Customization

### Adding New Providers

Add new providers in `lib/auth.config.ts`:

```typescript
providers: [
  // ... existing providers
  FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  }),
]
```

### Custom Sign-in Page

The system includes a custom sign-in page at `/auth/signin`. Customize the UI in `src/app/auth/signin/page.tsx`.

### Role Management

Extend the user model and session callbacks to support custom roles and permissions.

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required env vars are set
2. **OAuth Redirect URIs**: Check callback URLs match your OAuth app settings
3. **MongoDB Connection**: Verify MongoDB URI and network access
4. **NEXTAUTH_SECRET**: Use a strong, random secret in production

### Debug Mode

Enable debug mode in development:

```typescript
debug: process.env.NODE_ENV === "development"
```

This will log detailed authentication information to the console.

## Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **HTTPS**: Always use HTTPS in production
3. **Session Security**: Configure appropriate session timeouts
4. **Database Security**: Secure your MongoDB instance
5. **Rate Limiting**: Consider implementing rate limiting for auth endpoints

## Dependencies

- `next-auth`: ^4.24.5
- `@next-auth/mongodb-adapter`: ^1.1.1
- `mongodb`: For database connectivity
- `next`: ^15.3.3
- `react`: ^19.0.0

## File Structure

```
├── lib/
│   ├── auth.config.ts      # NextAuth configuration
│   ├── auth.utils.ts       # Server-side auth utilities
│   └── mongodb.js          # MongoDB connection
├── components/auth/
│   ├── AuthButton.tsx      # Sign-in/out buttons
│   ├── AuthGuard.tsx       # Route protection component
│   └── AuthShowcase.js     # Main auth UI
├── hooks/
│   └── useAuth.ts          # Client-side auth hooks
├── pages/api/auth/
│   └── [...nextauth].js    # NextAuth API routes
├── src/app/auth/
│   ├── signin/page.tsx     # Custom sign-in page
│   └── error/page.tsx      # Error page
├── middleware.ts           # Route protection middleware
└── types/
    └── next-auth.d.ts      # TypeScript definitions
```