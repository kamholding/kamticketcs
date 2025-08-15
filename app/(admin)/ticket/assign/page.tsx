'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { handleAssignUser } from './utils/handleAssignUser';
import { Listbox } from '@headlessui/react';

// ✅ Define proper types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: number;
  title: string;
  subcategory: string;
  details: string;
  image?: string;
}

const fetchAllData = async (): Promise<{ users: User[]; tickets: Ticket[] }> => {
  const [userResponse, ticketResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`),
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/unassigned`)
  ]);

  if (!userResponse.ok || !ticketResponse.ok) {
    throw new Error('Failed to fetch users or tickets.');
  }

  const users: User[] = await userResponse.json();
  const tickets: Ticket[] = await ticketResponse.json();
  return { users, tickets };
};

export default function AssignTicket() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user?.role !== 'Superadmin') {
        router.replace('/unauthorized');
        return;
      }

      const loadData = async () => {
        setLoading(true);
        try {
          const { users, tickets } = await fetchAllData();
          setUsers(users);
          setTickets(tickets);
        } catch (err) {
          if (err instanceof Error) {
            setMessage(err.message);
          } else {
            setMessage('An unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [authLoading, user, router]);

  const selectedTicketDetails = tickets.find(t => t.id === selectedTicket?.id);
  const selectedUserDetails = users.find(u => u.id === selectedUser?.id);

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 bg-gray-50 min-h-screen">
      <div className="w-full bg-white shadow-md rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-10">Assign User to Ticket</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Ticket Details */}
            {selectedTicketDetails && (
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ticket Details</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="font-medium bg-gray-50 p-3 w-40">Title</td>
                        <td className="p-3">{selectedTicketDetails.title}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="font-medium bg-gray-50 p-3">Subcategory</td>
                        <td className="p-3">{selectedTicketDetails.subcategory}</td>
                      </tr>
                      <tr>
                        <td className="font-medium bg-gray-50 p-3">Description</td>
                        <td className="p-3">{selectedTicketDetails.details}</td>
                      </tr>
                      {selectedTicketDetails.image && (
                        <tr>
                          <td className="font-medium bg-gray-50 p-3">Image</td>
                          <td className="p-3">
                            <img
                              src={selectedTicketDetails.image}
                              alt="Ticket"
                              className="w-24 rounded"
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* User Details */}
            {selectedUserDetails && (
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Details</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="font-medium bg-gray-50 p-3 w-40">Name</td>
                        <td className="p-3">{selectedUserDetails.name}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="font-medium bg-gray-50 p-3">Email</td>
                        <td className="p-3">{selectedUserDetails.email}</td>
                      </tr>
                      <tr>
                        <td className="font-medium bg-gray-50 p-3">Role</td>
                        <td className="p-3">{selectedUserDetails.role}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ticket Select */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Ticket</label>
              <Listbox value={selectedTicket} onChange={setSelectedTicket}>
                <div className="relative">
                  <Listbox.Button className="w-full border rounded-lg p-3 text-left">
                    {selectedTicket ? selectedTicket.title : 'Select Ticket'}
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-black shadow">
                    {tickets.map(ticket => (
                      <Listbox.Option
                        key={ticket.id}
                        value={ticket}
                        className={({ active, selected }) =>
                          [
                            "cursor-pointer p-3",
                            active ? "bg-blue-100" : "bg-white",
                            selected ? "bg-transparent" : ""
                          ].join(" ")
                        }
                      >
                        {ticket.title}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            {/* User Select */}
            <div>
              <label className="block text-sm font-medium mb-2">Select User</label>
              <Listbox value={selectedUser} onChange={setSelectedUser}>
                <div className="relative">
                  <Listbox.Button className="w-full border rounded-lg p-3 text-left">
                    {selectedUser ? selectedUser.name : 'Select User'}
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow">
                    {users.map(user => (
                      <Listbox.Option
                        key={user.id}
                        value={user}
                        className="cursor-pointer p-3 bg-white hover:bg-blue-100"
                      >
                        {user.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 font-semibold rounded-lg disabled:opacity-50"
                onClick={() =>
                  handleAssignUser({
                    selectedTicket: selectedTicket?.id,
                    selectedUser: selectedUser?.id,
                    setMessage,
                    tickets,
                    users,
                  })
                }
                disabled={!selectedTicket || !selectedUser}
              >
                Assign User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
