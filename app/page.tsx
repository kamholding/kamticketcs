'use client';

import { FiEdit, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Header */}
      <header className="text-center px-6 py-16 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <h1 className="mb-4 text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white">
          Welcome to Kam Helpdesk
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Your centralized support system for logging, tracking, and analyzing IT & operational requests efficiently.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Quick Action Cards */}
      <main className="flex-1 px-6 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          {/* Create Ticket Card */}
          <Link
            href="/ticket/add"
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
        </div>
      </main>

      {/* About Section */}
      <section className="bg-white dark:bg-gray-800 py-16 px-6 border-t dark:border-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Why Choose Kam Helpdesk?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Designed with simplicity and power in mind, Kam Helpdesk empowers your team to manage support
            requests with clarity, speed, and confidence. Whether you are creating tickets or tracking
            progress, our intuitive interface helps you get more done in less time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-center text-sm text-gray-500 dark:text-gray-400 py-6 border-t dark:border-gray-800">
        &copy; {new Date().getFullYear()} Kam Helpdesk. All rights reserved.
      </footer>
    </div>
  );
}
