'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';

export default function HealthPage() {
  const { healthData, loading, error, fetchHealthStatus } = useAdminStore();

  useEffect(() => {
    fetchHealthStatus();
  }, [fetchHealthStatus]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Backend Health Check
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor the status of your backend API
            </p>
          </div>

          <div className="p-6">
            <button
              onClick={fetchHealthStatus}
              disabled={loading}
              className={`w-full mb-6 px-4 py-2 rounded-md text-sm font-medium ${loading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {loading ? 'Checking...' : 'Refresh Health Status'}
            </button>

            {loading && (
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error fetching health status
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {healthData && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Health Status Information
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthData.status === 'ok'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {healthData.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Version</dt>
                      <dd className="mt-1 text-sm text-gray-900">{healthData.version}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(healthData.timestamp).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}