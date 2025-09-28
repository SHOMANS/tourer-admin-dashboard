'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

interface CarouselForm {
  title: string;
  description: string;
  imageUrl: string;
  actionType: 'INTERNAL' | 'EXTERNAL';
  actionValue: string;
  isActive: boolean;
  sortOrder: number;
}

interface FormErrors {
  title?: string;
  imageUrl?: string;
  actionValue?: string;
  sortOrder?: string;
}

const initialForm: CarouselForm = {
  title: '',
  description: '',
  imageUrl: '',
  actionType: 'INTERNAL',
  actionValue: '',
  isActive: true,
  sortOrder: 0,
};

export default function EditCarouselPage() {
  const { user, checkAuthStatus, accessToken } = useAdminStore();
  const router = useRouter();
  const params = useParams();
  const carouselId = params.id as string;

  const [form, setForm] = useState<CarouselForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/admin-login');
      return;
    }

    loadCarouselItem();
  }, [checkAuthStatus, router, carouselId]);

  const loadCarouselItem = async () => {
    try {
      setFetchingItem(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/carousel/${carouselId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch carousel item');
      }

      const data = await response.json();
      const item = data.data;

      if (item) {
        setForm({
          title: item.title,
          description: item.description || '',
          imageUrl: item.imageUrl,
          actionType: item.actionType,
          actionValue: item.actionValue,
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        });
      } else {
        alert('Carousel item not found');
        router.push('/carousel');
      }
    } catch (error) {
      console.error('Error loading carousel item:', error);
      alert('Failed to load carousel item data');
      router.push('/carousel');
    } finally {
      setFetchingItem(false);
    }
  };

  const updateForm = (field: keyof CarouselForm, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}${data.data.url}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      updateForm('imageUrl', imageUrl);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Image is required';
    if (!form.actionValue.trim()) newErrors.actionValue = 'Action value is required';
    if (form.sortOrder < 0) newErrors.sortOrder = 'Sort order must be 0 or greater';

    // Validate URL for external actions
    if (form.actionType === 'EXTERNAL') {
      try {
        new URL(form.actionValue);
      } catch {
        newErrors.actionValue = 'Must be a valid URL for external actions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/carousel/${carouselId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to update carousel item');
      }

      alert('Carousel item updated successfully!');
      router.push('/carousel');
    } catch (error) {
      console.error('Error updating carousel item:', error);
      alert('Failed to update carousel item. Please try again.');
    } finally {
      setLoading(false);
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

  if (fetchingItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading carousel item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Carousel Item</h1>
          <p className="mt-2 text-gray-600">Update the carousel item details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The basic details of your carousel item.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.title ? 'border-red-300' : ''
                        }`}
                      placeholder="e.g., Special Offer: 50% Off Mountain Tours"
                    />
                    {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={form.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Optional description for the carousel item"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                      Image *
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="url"
                        id="imageUrl"
                        value={form.imageUrl}
                        onChange={(e) => updateForm('imageUrl', e.target.value)}
                        className={`flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.imageUrl ? 'border-red-300' : ''
                          }`}
                        placeholder="https://example.com/image.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="imageFile"
                      />
                      <label
                        htmlFor="imageFile"
                        className={`inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload'}
                      </label>
                    </div>
                    {errors.imageUrl && <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>}
                    {form.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="h-32 w-48 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="actionType" className="block text-sm font-medium text-gray-700">
                      Action Type
                    </label>
                    <select
                      id="actionType"
                      value={form.actionType}
                      onChange={(e) => updateForm('actionType', e.target.value as 'INTERNAL' | 'EXTERNAL')}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="INTERNAL">Internal (App Screen)</option>
                      <option value="EXTERNAL">External (Website URL)</option>
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="actionValue" className="block text-sm font-medium text-gray-700">
                      Action Value *
                    </label>
                    <input
                      type="text"
                      id="actionValue"
                      value={form.actionValue}
                      onChange={(e) => updateForm('actionValue', e.target.value)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.actionValue ? 'border-red-300' : ''
                        }`}
                      placeholder={form.actionType === 'INTERNAL' ? 'e.g., Tours' : 'e.g., https://example.com'}
                    />
                    {errors.actionValue && <p className="mt-2 text-sm text-red-600">{errors.actionValue}</p>}
                    <p className="mt-1 text-sm text-gray-500">
                      {form.actionType === 'INTERNAL'
                        ? 'Screen name to navigate to (e.g., Tours, Profile)'
                        : 'Full URL to open in browser'
                      }
                    </p>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      min="0"
                      value={form.sortOrder}
                      onChange={(e) => updateForm('sortOrder', parseInt(e.target.value) || 0)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.sortOrder ? 'border-red-300' : ''
                        }`}
                    />
                    {errors.sortOrder && <p className="mt-2 text-sm text-red-600">{errors.sortOrder}</p>}
                    <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => updateForm('isActive', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active (visible in app)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/carousel')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${loading || uploadingImage
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Updating...' : uploadingImage ? 'Uploading...' : 'Update Carousel Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}