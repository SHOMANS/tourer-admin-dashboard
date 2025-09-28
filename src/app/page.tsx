'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

export default function HomePage() {
  const router = useRouter();
  const { accessToken, checkAuthStatus } = useAdminStore();

  useEffect(() => {
    if (checkAuthStatus() && accessToken) {
      // If already authenticated, redirect to dashboard
      router.replace('/dashboard');
    } else {
      // If not authenticated, redirect to login
      router.replace('/admin-login');
    }
  }, [accessToken, checkAuthStatus, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}
