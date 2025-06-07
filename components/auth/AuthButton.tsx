'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

interface AuthButtonProps {
  provider?: 'google' | 'github';
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function SignInButton({ provider, className = '', variant = 'primary' }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 text-white hover:bg-blue-700" 
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  const providerName = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'OAuth';

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? 'Signing in...' : `Sign in with ${providerName}`}
    </button>
  );
}

export function SignOutButton({ className = '', variant = 'secondary' }: Omit<AuthButtonProps, 'provider'>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50";
  const variantClasses = variant === 'primary' 
    ? "bg-red-600 text-white hover:bg-red-700" 
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700">
            {session.user.name || session.user.email}
          </span>
        </div>
        <SignOutButton />
      </div>
    );
  }

  return null;
}