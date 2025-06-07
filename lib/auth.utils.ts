import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth.config";
import { redirect } from "next/navigation";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/auth/signin');
  }
  return session;
}

export function isAuthenticated(session: any): boolean {
  return !!session?.user;
}

export function getUserRole(session: any): string | null {
  return session?.user?.role || null;
}

export function hasPermission(session: any, requiredRole: string): boolean {
  const userRole = getUserRole(session);
  // Add your role hierarchy logic here
  return userRole === requiredRole || userRole === 'admin';
}