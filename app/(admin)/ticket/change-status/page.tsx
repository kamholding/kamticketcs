'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner"; // ✅ using your custom spinner

interface Ticket {
  id: number;
  title: string;
  details: string;
  date: string;
  assignedTo: string;
  status: string;
  createdBy: string;
  department: string;
  image: string | null;
}

export default function ChangeTicketStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [openTickets, setOpenTickets] = useState<{ [id: number]: boolean }>({});
  const [statusUpdates, setStatusUpdates] = useState<{ [id: number]: string }>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/unauthorized");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.email) return;

      try {
        const userRes = await fetch(`http://localhost:5000/api/users/email/${user.email}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        const userId = userData.id;

        const ticketsRes = await fetch(`http://localhost:5000/api/tickets/assigned/${userId}`);
        if (!ticketsRes.ok) throw new Error("Failed to fetch tickets");
        const fetchedTickets = await ticketsRes.json();

        setTickets(fetchedTickets);

        const expandedMap: { [id: number]: boolean } = {};
        fetchedTickets.forEach((ticket: Ticket) => {
          expandedMap[ticket.id] = true;
        });
        setOpenTickets(expandedMap);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Could not load tickets.");
      }
    };

    if (user?.email) {
      fetchTickets();
    }
  }, [user]);

  const toggleTicket = (id: number) => {
    setOpenTickets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = async (id: number) => {
    try {
      const status = statusUpdates[id];
      if (!status) return;

      const res = await fetch(`http://localhost:5000/api/tickets/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === id ? { ...ticket, status } : ticket
        )
      );

      setStatusUpdates((prev) => ({ ...prev, [id]: "" }));
      setMessage(`✅ Ticket ${id} updated to "${status}".`);
      setError("");
    } catch (err) {
      console.error(err);
      setError(`❌ Failed to update ticket ${id}.`);
      setMessage("");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={12} /> {/* ✅ replaced antd Spin */}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">Change Ticket Status</h1>
      {message && <p className="text-green-600 text-center">{message}</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {tickets.length === 0 && (
        <p className="text-center text-gray-500">No tickets assigned to you.</p>
      )}

      {tickets.map((ticket) => {
        const {
          id,
          title,
          details,
          date,
          assignedTo,
          status,
          createdBy,
          department,
          image,
        } = ticket;
        return (
          <div
            key={id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              <button
                onClick={() => toggleTicket(id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {openTickets[id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {openTickets[id] && (
              <div className="px-6 py-4 space-y-6 bg-white transition-all">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Details</h4>
                  <p className="text-base text-gray-700">{details}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[["Date", date], ["Assigned To", assignedTo], ["Status", status], ["Created By", createdBy], ["Department", department]].map(
                    ([label, value], i) => (
                      <div key={i}>
                        <h4 className="text-sm font-semibold text-gray-500">{label}</h4>
                        <p className="text-gray-700">{value}</p>
                      </div>
                    )
                  )}
                </div>
                {image && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Image</h4>
                    <img
                      src={image}
                      alt="Ticket"
                      className="w-32 h-24 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    Change Status:
                  </label>
                  <select
                    value={statusUpdates[id] || ""}
                    onChange={(e) =>
                      setStatusUpdates((prev) => ({ ...prev, [id]: e.target.value }))
                    }
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="">Select new status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleStatusChange(id)}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
