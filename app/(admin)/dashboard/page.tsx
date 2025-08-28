'use client';

import Head from "next/head";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  UserPlus,
  Users,
  BarChart3,
  
} from "lucide-react";
import React from "react";

// Reusable Card Component
const ActionCard = ({
  href,
  label,
  description,
  icon: Icon,
  color = "text-blue-600"
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color?: string;
}) => (
  <Link
    href={href}
    className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition duration-200 text-center"
  >
    <Icon className={`mx-auto mb-2 ${color}`} size={28} />
    <h4 className="text-lg font-semibold text-gray-800 mb-2">{label}</h4>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect users without GM or Manager roles
  useEffect(() => {
    if (!loading && user) {
      console.log("User role:", user.role);
      if (user.role !== "GM" && user.role !== "Manager") {
        router.push("/ticket/view");
      }
    }
  }, [user, loading, router]);

  // Show loading screen while checking user
  if (loading || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-200">Loading...</p>
      </div>
    );
  }

  // Only render once user is loaded and role confirmed
  if (user.role !== "GM" && user.role !== "Manager") {
    return null; // User will be redirected
  }

  // Build actions dynamically based on role
  const actions = [
    { label: "View Tickets", href: "/ticket/view", icon: ClipboardList },
    { label: "Analytics Dashboard", href: "/ticket/analysis", icon: BarChart3 },
    ...(user.role === "GM" ? [{ label: "Add User", href: "/users/add", icon: UserPlus }] : []),
    { label: "View Users", href: "/users/view", icon: Users },
  ];

  return (
    <>
      <Head>
        <title>Kam Helpdesk</title>
        <meta name="description" content="Kam Helpdesk Portal" />
      </Head>

      <main className="min-h-screen bg-gray-100 text-gray-800">
        {/* Hero Header */}
        <section className="bg-blue-700 text-white py-16 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kam Helpdesk</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            A centralized support portal for managing tickets, tracking issues, and improving operational efficiency.
          </p>
        </section>

        {/* Quick Actions */}
        <section className="py-16 px-6 bg-white border-t border-gray-200">
          <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">Quick Actions by Role</h2>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-blue-700 text-center mb-6">{user.role === 'GM'? 'General Manager' : user.role}</h3>
            <p className="text-center text-gray-600 mb-10">
              {user.role === "GM" ? "Full access to manage tickets, users, and system settings." : "Limited access to view tickets and dashboards."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {actions.map(({ label, href, icon }) => (
                <ActionCard key={label} href={href} label={label} description="Manage related activities" icon={icon} />
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-blue-800 text-white text-center py-6 mt-10">
          <p>&copy; {new Date().getFullYear()} Kam Helpdesk. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
