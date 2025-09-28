'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  itinerary: { day: number; title: string; description: string; }[];
  included: string[];
  excluded: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  price?: string;
  duration?: string;
}

const initialForm: PackageForm = {
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
  itinerary: [{ day: 1, title: '', description: '' }],
  included: [],
  excluded: [],
};

export default function EditPackagePage() {
  const { user, checkAuthStatus, updatePackage, fetchPackageById, packages, accessToken } = useAdminStore();
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [form, setForm] = useState<PackageForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingPackage, setFetchingPackage] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/admin-login');
      return;
    }

    // Load package data
    loadPackageData();
  }, [checkAuthStatus, router, packageId]);

  const loadPackageData = async () => {
    try {
      setFetchingPackage(true);
      // First try to find in existing packages
      let packageData = packages.find((pkg: any) => pkg.id === packageId);

      // If not found, fetch by ID (we'll need to add this method)
      if (!packageData && fetchPackageById) {
        const fetchedPackage = await fetchPackageById(packageId);
        packageData = fetchedPackage || undefined;
      }

      if (packageData) {
        setForm({
          title: packageData.title,
          description: packageData.description,
          location: packageData.location,
          price: packageData.price,
          duration: packageData.duration,
          category: packageData.category as PackageForm['category'],
          difficulty: packageData.difficulty as PackageForm['difficulty'],
          coverImage: packageData.coverImage || '',
          images: [], // We'll enhance this later with image management
          highlights: [], // We'll enhance this later
          itinerary: [{ day: 1, title: '', description: '' }], // We'll enhance this later
          included: [], // We'll enhance this later
          excluded: [], // We'll enhance this later
        });
      } else {
        alert('Package not found');
        router.push('/packages');
      }
    } catch (error) {
      console.error('Error loading package:', error);
      alert('Failed to load package data');
      router.push('/packages');
    } finally {
      setFetchingPackage(false);
    }
  };

  const updateForm = (field: keyof PackageForm, value: string | number | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const addHighlight = () => {
    setForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const removeHighlight = (index: number) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      updateForm('coverImage', imageUrl);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (form.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.duration < 1) newErrors.duration = 'Duration must be at least 1 day';

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
      const updateData = {
        title: form.title,
        description: form.description,
        location: form.location,
        price: form.price,
        duration: form.duration,
        category: form.category,
        difficulty: form.difficulty,
        coverImage: form.coverImage,
      };

      await updatePackage(packageId, updateData);
      alert('Package updated successfully!');
      router.push('/packages');
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
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

  if (fetchingPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
          <p className="mt-2 text-gray-600">Update the details of your tour package.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.title ? 'border-red-300' : ''
                        }`}
                      placeholder="e.g., Amazing Bali Adventure Tour"
                    />
                    {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={form.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''
                        }`}
                      placeholder="Describe your amazing tour package..."
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={form.location}
                      onChange={(e) => updateForm('location', e.target.value)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.location ? 'border-red-300' : ''
                        }`}
                      placeholder="e.g., Bali, Indonesia"
                    />
                    {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                      Cover Image
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="url"
                        id="coverImage"
                        value={form.coverImage}
                        onChange={(e) => updateForm('coverImage', e.target.value)}
                        className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                    {form.coverImage && (
                      <div className="mt-2">
                        <img
                          src={form.coverImage}
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
                      value={form.price}
                      onChange={(e) => updateForm('price', parseFloat(e.target.value) || 0)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.price ? 'border-red-300' : ''
                        }`}
                    />
                    {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      value={form.duration}
                      onChange={(e) => updateForm('duration', parseInt(e.target.value) || 1)}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.duration ? 'border-red-300' : ''
                        }`}
                    />
                    {errors.duration && <p className="mt-2 text-sm text-red-600">{errors.duration}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => updateForm('category', e.target.value as PackageForm['category'])}
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
                      value={form.difficulty}
                      onChange={(e) => updateForm('difficulty', e.target.value as PackageForm['difficulty'])}
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
                  {form.highlights.map((highlight, index) => (
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
              {loading ? 'Updating...' : uploadingImage ? 'Uploading...' : 'Update Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}