'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TestLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call our test login endpoint
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login successful:', data);
      
      // Redirect to dashboard or home page
      router.push('/');
      
    } catch (err) {
      console.error('Test login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to log in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Test Login</h1>
          <p className="mt-2 text-gray-600">
            Click the button below to log in with test credentials
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              'Login with Test Account'
            )}
          </Button>
        </div>

        <div className="mt-4 text-sm text-center text-gray-600">
          <p>This will log you in with a test admin account.</p>
          <p className="mt-1 text-xs text-gray-500">
            Note: This is for testing purposes only. In production, use the actual login flow.
          </p>
        </div>
      </div>
    </div>
  );
}
