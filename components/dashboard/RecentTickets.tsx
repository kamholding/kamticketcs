"use client";
import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";

interface Ticket {
  id: number;
  title: string;
  department: string;
  category: string;
  status: "Resolved" | "Open" | "Closed";
  image: string | null;
}

export default function RecentTickets() {
  const tickets: Ticket[] = [
    { id: 1, title: "Cannot login to account", department: "Support", category: "Login Issue", status: "Open", image: null },
    { id: 2, title: "Bug in payment gateway", department: "Billing", category: "Bug Report", status: "Resolved", image: null },
    { id: 3, title: "Request for new feature", department: "Development", category: "Feature Request", status: "Closed", image: null },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const showImageModal = (image: string) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-700";
      case "Open": return "bg-orange-100 text-orange-700";
      case "Closed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tickets</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b text-left">Title</th>
              <th className="p-3 border-b text-left">Department</th>
              <th className="p-3 border-b text-left">Category</th>
              <th className="p-3 border-b text-left">Status</th>
              <th className="p-3 border-b text-left">Image</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition">
                <td className="p-3 border-b">{ticket.title}</td>
                <td className="p-3 border-b">{ticket.department}</td>
                <td className="p-3 border-b">{ticket.category}</td>
                <td className="p-3 border-b">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getBadgeClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-3 border-b">
                  {ticket.image ? (
                    <Image
                      src={ticket.image}
                      alt="Ticket"
                      width={50}
                      height={50}
                      className="cursor-pointer rounded-md"
                      onClick={() => showImageModal(ticket.image!)}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-4 shadow-lg max-w-2xl w-full">
            <Image
              src={selectedImage}
              alt="Ticket"
              width={800}
              height={600}
              className="rounded-lg"
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
