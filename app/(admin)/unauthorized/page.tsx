'use client';

import { useRouter } from 'next/navigation';

export default function Unauthorized() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-4 text-lg text-gray-700">
        You do not have permission to view this page.
      </p>
      <button
        onClick={handleRedirect}
        className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200"
      >
        Go to Home
      </button>
    </div>
  );
}
