'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to your Medical Assistant Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Hello, {session.user?.name}! Your email: {session.user?.email}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Consultations</h3>
                  <p className="text-gray-600">Manage your medical consultations</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    View Consultations
                  </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Health Records</h3>
                  <p className="text-gray-600">View and update health records</p>
                  <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    View Records
                  </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Assistant</h3>
                  <p className="text-gray-600">Chat with your medical AI assistant powered by GPT-4o</p>
                  <a
                    href="/chat"
                    className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Start Chat
                  </a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Symptom Checker</h3>
                  <p className="text-gray-600">AI-driven analysis of your symptoms with next-step suggestions</p>
                  <a
                    href="/symptom-checker"
                    className="mt-4 inline-block bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Try Symptom Checker
                  </a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Health Metrics</h3>
                  <p className="text-gray-600">Track your weight, blood pressure, blood sugar, and medication history with interactive charts</p>
                  <a
                    href="/dashboard/metrics"
                    className="mt-4 inline-block bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition-colors"
                  >
                    View Metrics
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}