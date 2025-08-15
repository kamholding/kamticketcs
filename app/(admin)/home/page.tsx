'use client';

import Head from "next/head";
import Link from "next/link";
import {
  PlusCircle,
  ClipboardList,
  UserPlus,
  Users,
  BarChart3,
  Repeat2,
  Settings,
  Ticket,
  FileSearch,
  CircleCheck,
  ShieldCheck,
  Activity,
  LayoutDashboard
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

// Static data arrays moved outside component to avoid recreation
const superadminActions = [
  { label: "Add Ticket", href: "/ticket/add", icon: PlusCircle },
  { label: "View Tickets", href: "/ticket/view", icon: ClipboardList },
  { label: "Assign Ticket", href: "/ticket/assign", icon: ShieldCheck },
  { label: "Re-assign Ticket", href: "/ticket/reassign", icon: Repeat2 },
  { label: "Analytics Dashboard", href: "/ticket/analysis", icon: BarChart3 },
  { label: "Change Ticket Status", href: "/ticket/change-status", icon: CircleCheck },
  { label: "Add User", href: "/users/add", icon: UserPlus },
  { label: "View Users", href: "/users/view", icon: Users },
];

const featuresList = [
  {
    title: "Instant Ticket Logging",
    desc: "Users and public visitors can report issues quickly using a simple form.",
    icon: PlusCircle,
  },
  {
    title: "Intuitive Tracking",
    desc: "Track ticket progress with real-time status and color-coded timelines.",
    icon: Activity,
  },
  {
    title: "Role-Based Management",
    desc: "Superadmins and admins can assign, reassign, and update tickets effortlessly.",
    icon: Settings,
  },
  {
    title: "Visual Insights",
    desc: "Get powerful analytics on ticket trends, resolution speed, and team performance.",
    icon: LayoutDashboard,
  },
];

export default function Home() {
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

        {/* Quick Actions by Role */}
        <section className="py-16 px-6 bg-white border-t border-gray-200">
          <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">
            Quick Actions by Role
          </h2>

          {/* Superadmin Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-blue-700 text-center mb-6">
              Superadmin
            </h3>
            <p className="text-center text-gray-600 mb-10">
              Full access to manage tickets, users, and system settings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {superadminActions.map(({ label, href, icon }) => (
                <ActionCard
                  key={label}
                  href={href}
                  label={label}
                  description="Manage related activities"
                  icon={icon}
                />
              ))}
            </div>
          </div>

          {/* Admin Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-green-700 text-center mb-6">
              Admin
            </h3>
            <p className="text-center text-gray-600 mb-10">
              Limited access to manage ticket status and progress.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <ActionCard
                href="/ticket/status"
                label="Change Ticket Status"
                description="Update status of assigned tickets"
                icon={CircleCheck}
                color="text-green-600"
              />
            </div>
          </div>

          {/* Public Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Public
            </h3>
            <p className="text-center text-gray-600 mb-10">
              Open access to raise and track support tickets.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <ActionCard
                href="/ticket/add"
                label="Submit a Ticket"
                description="Report an issue or request"
                icon={Ticket}
                color="text-gray-700"
              />
              <ActionCard
                href="/track-ticket"
                label="Track Your Ticket"
                description="Check ticket progress and resolution"
                icon={FileSearch}
                color="text-gray-700"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Why Kam Helpdesk?</h2>
            <p className="text-gray-700 text-lg">
              Kam Helpdesk streamlines IT and operational support with a clean, user-friendly interface.
              Built for speed, simplicity, and role-specific control, it empowers superadmins, admins,
              users, and even public visitors to take the right actions with minimal effort.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-10">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuresList.map(({ title, desc, icon: Icon }) => (
                <div
                  key={title}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <Icon className="mb-3 text-blue-600" size={26} />
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-blue-800 text-white text-center py-6 mt-10">
          <p>&copy; {new Date().getFullYear()} Kam Helpdesk. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
