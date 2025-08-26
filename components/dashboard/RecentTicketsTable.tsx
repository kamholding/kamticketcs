"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import { exportToExcel } from "@/components/utils/exportExcel"; // adjust path

interface Ticket {
  id: number;
  name: string;
  email: string;
  assigned_to: string | null;
  phone: string;
  location: string;
  department: string;
  status: string;
  category: string;
  subCategory: string;
  otherSubCategory: string | null;
  title: string;
  details: string;
  created_at: string;
}

export default function RecentTicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchRecentTickets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/recent/latest`
        );
        if (!response.ok) throw new Error("Failed to fetch tickets");

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load recent tickets.");
        toast.error("Unable to load recent tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTickets();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Unresolved":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleExport = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets`
    );
    if (!response.ok) throw new Error("Failed to fetch tickets for export");

    const allTickets: Ticket[] = await response.json();

    const formattedData = allTickets.map((t) => ({
      ID: t.id,
      Name: t.name,
      Email: t.email,
      "Assigned To": t.assigned_to || "Unassigned",
      Phone: t.phone,
      Location: t.location,
      Department: t.department,
      Status: t.status,
      Category: t.category,
      SubCategory: t.subCategory,
      "Other SubCategory": t.otherSubCategory,
      Title: t.title,
      Details: t.details,
      // 🚫 Excluding image field
      "Created At": new Date(t.created_at).toLocaleString(),
    }));

    exportToExcel(formattedData, "all_tickets.xlsx");
  } catch (err) {
    console.error(err);
    toast.error("Unable to export tickets.");
  }
};



  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
    Recent Tickets
  </h3>
  <button
    onClick={handleExport}
    className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
  >
    Export Excel
  </button>
</div>
      <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
        Overview of most recently submitted tickets
      </p>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        </div>
      ) : error ? (
        <p className="mt-4 text-red-500">{error}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left border-b">Title</th>
                <th className="p-3 text-left border-b">Department</th>
                <th className="p-3 text-left border-b">Category</th>
                <th className="p-3 text-left border-b">Assigned To</th>
                <th className="p-3 text-left border-b">Status</th>
                <th className="p-3 text-left border-b">Created At</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="p-3 border-b">{ticket.title}</td>
                  <td className="p-3 border-b">{ticket.department}</td>
                  <td className="p-3 border-b">{ticket.category}</td>
                  <td className="p-3 border-b text-gray-500">
                    {ticket.assigned_to || "Unassigned"}
                  </td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    {new Date(ticket.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full dark:bg-gray-800">
            {selectedTicket && (
              <>
                <Dialog.Title className="text-lg font-bold text-gray-800 dark:text-white">
                  {selectedTicket.title}
                </Dialog.Title>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Department: {selectedTicket.department}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Status: {selectedTicket.status}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Created At:{" "}
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
