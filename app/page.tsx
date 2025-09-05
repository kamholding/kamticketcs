'use client';

import { FiEdit, FiLogIn, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Header */}
      <header className="text-center px-2 py-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <h1 className="mb-2 text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
          Kam Corporate Service Helpdesk
        </h1>
      </header>
     
      {/* Quick Action Cards */}
      <main className="flex-1 px-6 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          {/* Create Ticket Card */}
          <Link
            href="/create-ticket"
            className="flex items-center gap-4 p-6 border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <FiEdit className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              Create Ticket
            </span>
          </Link>

          {/* Track Ticket Card */}
          <Link
            href="/track-ticket"
            className="flex items-center gap-4 p-6 border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
              <FiSearch className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              Track Ticket
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-4 p-6 border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="p-3 rounded-full bg-green-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
              <FiLogIn className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              Admin Login
            </span>
          </Link>
        </div>
      </main>

     

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-center text-sm text-gray-500 dark:text-gray-400 py-6 border-t dark:border-gray-800">
        &copy; {new Date().getFullYear()} Kam Helpdesk. All rights reserved.
      </footer>
    </div>
  );
}
