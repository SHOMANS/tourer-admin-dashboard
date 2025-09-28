'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminStore } from '@/store/adminStore';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  actionType: 'INTERNAL' | 'EXTERNAL';
  actionValue: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function CarouselManagementPage() {
  const {
    user,
    checkAuthStatus,
    accessToken
  } = useAdminStore();
  const router = useRouter();

  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/admin-login');
      return;
    }
    fetchCarouselItems();
  }, [checkAuthStatus, router]);

  const fetchCarouselItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/carousel/admin`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch carousel items');
      }

      const data = await response.json();
      setCarouselItems(data.data || []);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      setError('Failed to fetch carousel items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/carousel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete carousel item');
      }

      alert('Carousel item deleted successfully');
      fetchCarouselItems();
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      alert('Failed to delete carousel item');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/carousel/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update carousel item');
      }

      alert(`Carousel item ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCarouselItems();
    } catch (error) {
      console.error('Error updating carousel item:', error);
      alert('Failed to update carousel item');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carousel Management</h1>
            <p className="mt-2 text-gray-600">Manage carousel items for the mobile app home screen.</p>
          </div>
          <button
            onClick={() => router.push('/carousel/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Item
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading carousel items...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              {carouselItems.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0118 28c2.624.824 4.837 2.607 6 4.999M32 28c2.624-.824 4.837-2.607 6-4.999"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No carousel items</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new carousel item.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/carousel/create')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add New Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {carouselItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-24 h-16 relative">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover rounded-md"
                              unoptimized={true}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {item.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Order: {item.sortOrder}
                              </span>
                            </div>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="flex items-center">
                              <span className={`mr-2 ${item.actionType === 'INTERNAL' ? 'text-blue-600' : 'text-green-600'}`}>
                                {item.actionType === 'INTERNAL' ? '🏠' : '🔗'}
                              </span>
                              {item.actionType}: {item.actionValue}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col space-y-2">
                          <button
                            onClick={() => router.push(`/carousel/${item.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(item.id, item.isActive)}
                            className={`text-sm font-medium ${item.isActive
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-green-600 hover:text-green-700'
                              }`}
                          >
                            {item.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}