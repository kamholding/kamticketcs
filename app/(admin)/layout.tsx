'use client';

import { useRouter } from "next/navigation";
import React, { useCallback } from "react";




export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [API_BASE_URL, router]);

  return (
   
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-end px-6 shadow-sm">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        </nav>

        

        <main className="pt-16 lg:pl-[80px] transition-all duration-300">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            {children}
          </div>
        </main>
      </div>
   
  );
}
