'use client';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthShowcase() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Welcome back!</h2>
          <p className="text-gray-600 mt-2">
            Signed in as <span className="font-medium">{session.user?.email}</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {session.user?.name}
          </p>
        </div>
        <div className="flex justify-center space-x-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Get Started</h2>
        <p className="text-gray-600">Sign in or create an account to continue</p>
      </div>
      <div className="space-y-3">
        <Link
          href="/auth/signin"
          className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="w-full block text-center px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors rounded-md"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}