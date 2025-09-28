'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminStore } from '@/store/adminStore';



export default function PackagesPage() {
  const {
    user,
    checkAuthStatus,
    packages,
    packagesLoading: loading,
    packagesError: error,
    fetchPackages,
    deletePackage
  } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/admin-login');
      return;
    }
    fetchPackages();
  }, [checkAuthStatus, router, fetchPackages]);

  const handleCreateNew = () => {
    router.push('/packages/create');
  };

  const handleEdit = (packageId: string) => {
    router.push(`/packages/${packageId}/edit`);
  };

  const handleDelete = async (packageId: string, packageTitle: string) => {
    if (confirm(`Are you sure you want to delete "${packageTitle}"?`)) {
      try {
        await deletePackage(packageId);
        alert('Package deleted successfully');
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Failed to delete package');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tour Package Management</h1>
              <p className="text-gray-600">Create and manage tour packages</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Package
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchPackages}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Tour Packages ({packages.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your tour packages and their details
              </p>
            </div>
            {packages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No packages</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new tour package.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create New Package
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <li key={pkg.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {pkg.coverImage && (
                            <div className="flex-shrink-0 h-16 w-24">
                              <Image
                                className="h-16 w-24 rounded-md object-cover"
                                src={pkg.coverImage}
                                alt={pkg.title}
                                width={96}
                                height={64}
                                unoptimized={true}
                                onError={(e) => {
                                  console.log('Image failed to load:', pkg.coverImage);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className={pkg.coverImage ? "ml-4" : ""}>
                            <div className="text-sm font-medium text-gray-900">
                              {pkg.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              📍 {pkg.location} • {pkg.duration} days • ${pkg.price}
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {pkg.category}
                              </span>
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {pkg.difficulty}
                              </span>
                              {pkg.rating && (
                                <span>⭐ {pkg.rating}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(pkg.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id, pkg.title)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}