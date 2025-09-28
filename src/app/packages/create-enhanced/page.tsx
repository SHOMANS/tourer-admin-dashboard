'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAdminStore } from '@/store/adminStore';

interface PackageForm {
  title: string;
  description: string;
  location: string;
  price: number;
  duration: number;
  category: 'ADVENTURE' | 'CULTURAL' | 'NATURE' | 'LUXURY' | 'BUDGET';
  difficulty: 'EASY' | 'MODERATE' | 'HARD';
  coverImage: string;
  images: string[];
  highlights: string[];
}

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  location: yup.string().required('Location is required'),
  price: yup.number().required('Price is required').min(0.01, 'Price must be greater than 0'),
  duration: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 day'),
  category: yup.string().oneOf(['ADVENTURE', 'CULTURAL', 'NATURE', 'LUXURY', 'BUDGET']).required(),
  difficulty: yup.string().oneOf(['EASY', 'MODERATE', 'HARD']).required(),
  coverImage: yup.string().url('Must be a valid URL').optional(),
  images: yup.array().of(yup.string().url('Must be a valid URL')).optional(),
  highlights: yup.array().of(yup.string()).optional(),
});

export default function CreatePackagePageEnhanced() {
  const { user, checkAuthStatus, createPackage, accessToken } = useAdminStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control
  } = useForm<PackageForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: 0,
      duration: 1,
      category: 'ADVENTURE',
      difficulty: 'EASY',
      coverImage: '',
      images: [],
      highlights: [],
    }
  });

  const watchedHighlights = watch('highlights') || [];

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/admin-login');
    }
  }, [checkAuthStatus, router]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/upload/image`, {
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
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${data.data.url}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      setValue('coverImage', imageUrl);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addHighlight = () => {
    const currentHighlights = watch('highlights') || [];
    setValue('highlights', [...currentHighlights, '']);
  };

  const updateHighlight = (index: number, value: string) => {
    const currentHighlights = watch('highlights') || [];
    const newHighlights = [...currentHighlights];
    newHighlights[index] = value;
    setValue('highlights', newHighlights);
  };

  const removeHighlight = (index: number) => {
    const currentHighlights = watch('highlights') || [];
    const newHighlights = currentHighlights.filter((_, i) => i !== index);
    setValue('highlights', newHighlights);
  };

  const onSubmit = async (data: PackageForm) => {
    setLoading(true);
    try {
      const packageData = {
        ...data,
        // Filter out empty highlights
        highlights: data.highlights?.filter(h => h.trim()) || [],
      };

      await createPackage(packageData);
      alert('Package created successfully!');
      router.push('/packages');
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Package</h1>
          <p className="mt-2 text-gray-600">Create a new tour package for your customers.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The fundamental details of your tour package.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Package Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register('title')}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.title ? 'border-red-300' : ''
                        }`}
                      placeholder="e.g., Amazing Bali Adventure Tour"
                    />
                    {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      {...register('description')}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''
                        }`}
                      placeholder="Describe your amazing tour package..."
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      {...register('location')}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.location ? 'border-red-300' : ''
                        }`}
                      placeholder="e.g., Bali, Indonesia"
                    />
                    {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                      Cover Image
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="url"
                        id="coverImage"
                        {...register('coverImage')}
                        className={`flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.coverImage ? 'border-red-300' : ''
                          }`}
                        placeholder="https://example.com/image.jpg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="coverImageFile"
                      />
                      <label
                        htmlFor="coverImageFile"
                        className={`inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload'}
                      </label>
                    </div>
                    {errors.coverImage && <p className="mt-2 text-sm text-red-600">{errors.coverImage.message}</p>}
                    {watch('coverImage') && (
                      <div className="mt-2">
                        <img
                          src={watch('coverImage')}
                          alt="Cover Preview"
                          className="h-20 w-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="0.01"
                      {...register('price')}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.price ? 'border-red-300' : ''
                        }`}
                    />
                    {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      {...register('duration')}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.duration ? 'border-red-300' : ''
                        }`}
                    />
                    {errors.duration && <p className="mt-2 text-sm text-red-600">{errors.duration.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      {...register('category')}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="ADVENTURE">Adventure</option>
                      <option value="CULTURAL">Cultural</option>
                      <option value="NATURE">Nature</option>
                      <option value="LUXURY">Luxury</option>
                      <option value="BUDGET">Budget</option>
                    </select>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty"
                      {...register('difficulty')}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Highlights */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Tour Highlights</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Key features and attractions of this tour.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-3">
                  {watchedHighlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Visit ancient temples"
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/packages')}
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
              {loading ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}