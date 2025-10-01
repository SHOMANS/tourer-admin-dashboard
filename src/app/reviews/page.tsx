'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

export default function ReviewsPage() {
  const {
    user,
    checkAuthStatus,
    reviews,
    reviewsLoading: loading,
    reviewsError: error,
    reviewsPagination,
    fetchAllReviews,
    approveReview,
    deleteReview,
  } = useAdminStore();

  const router = useRouter();
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!checkAuthStatus()) {
      router.push('/admin-login');
      return;
    }
    fetchAllReviews(currentPage, 10, filterVerified);
  }, [checkAuthStatus, router, fetchAllReviews, currentPage, filterVerified]);

  const handleApprove = async (reviewId: string) => {
    if (confirm('Are you sure you want to approve this review?')) {
      try {
        await approveReview(reviewId);
        alert('Review approved successfully');
      } catch (error) {
        console.error('Error approving review:', error);
        alert('Failed to approve review');
      }
    }
  };

  const handleDelete = async (reviewId: string, userEmail: string) => {
    if (confirm(`Are you sure you want to delete the review from "${userEmail}"?`)) {
      try {
        await deleteReview(reviewId);
        alert('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setFilterVerified(undefined);
    } else if (value === 'verified') {
      setFilterVerified(true);
    } else if (value === 'unverified') {
      setFilterVerified(false);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reviews Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={filterVerified === undefined ? 'all' : filterVerified ? 'verified' : 'unverified'}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading reviews...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      {!loading && !error && (
        <>
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.user.firstName} {review.user.lastName}
                        </h3>
                        <span className="text-sm text-gray-500">({review.user.email})</span>
                        {review.isVerified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-lg">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-600">
                          ({review.rating}/5 stars)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Tour: <span className="font-medium">{review.package.title}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    {!review.isVerified && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Approve Review
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id, review.user.email)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {reviewsPagination && reviewsPagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600 mx-4">
                Page {reviewsPagination.page} of {reviewsPagination.pages}
                ({reviewsPagination.total} total reviews)
              </span>

              <button
                onClick={() => handlePageChange(Math.min(reviewsPagination.pages, currentPage + 1))}
                disabled={currentPage === reviewsPagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">
                {filterVerified === true
                  ? 'No verified reviews found.'
                  : filterVerified === false
                    ? 'No unverified reviews found.'
                    : 'No reviews have been submitted yet.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}