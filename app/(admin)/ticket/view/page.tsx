'use client'

import React, { useState, useEffect, ChangeEvent, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { handleAssignUser } from "@/components/utils/handleAssignUser";
import { handleReassignUser } from "@/components/utils/handleReassignUser";
import { handleResolveTicket } from "@/components/utils/handleResolveTicket";


type Comment = {
  id: number
  ticket_id: number
  content: string
  isAdmin: boolean
  created_at: string
}

type Ticket = {
  id: number
  title: string
  details: string
  date: string
  assignedTo: string
  status: string
  category: string
  subCategory: string
  otherSubCategory?: string | null
  createdBy: string
  department: string
  image?: string
  images?: string[]
  email: string
}

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
}

type BackendTicket = {
  id: number
  name?: string
  email?: string
  created_at?: string
  assigned_to?: number
  status?: string
  details?: string
  created_by?: string
  department?: string
  image?: string
}

const parseTicketDateToISO = (dateStr: string): string | null => {
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
}

const Page = () => {
  const { user } = useAuth()
  const router = useRouter()

  const [usersMap, setUsersMap] = useState<Record<number, string>>({})
  const [tickets, setTickets] = useState<Ticket[]>([])
// const handleChangeStatus = (ticketId: number, newStatus: string) => {
//   // 🔑 call your backend here to update status
//   console.log("Change status", ticketId, newStatus);
// };
  const [openTickets, setOpenTickets] = useState<Record<number, boolean>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusUpdates, setStatusUpdates] = useState<{ [id: number]: string }>({});
  const [message, setMessage] = useState<string>('');
  const [assignMessage, setAssignMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  const [comments, setComments] = useState<Record<number, Comment[]>>({})
const [newComments, setNewComments] = useState<Record<number, string>>({})

  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ startDate: '', endDate: '', department: '', status: '' })
  const filterRef = useRef<HTMLDivElement>(null)
  const [filterHeight, setFilterHeight] = useState(0)

  // ✅ new: track selected assignees for each ticket
  const [selectedUsers, setSelectedUsers] = useState<Record<number, string>>({})

  // ⬇️ auto clear assignMessage after 5s
useEffect(() => {
  if (assignMessage) {
    const timer = setTimeout(() => setAssignMessage(""), 5000);
    return () => clearTimeout(timer);
  }
}, [assignMessage]);


  // Resize listener
  useEffect(() => {
    const updateHeight = () => filterRef.current && setFilterHeight(filterRef.current.offsetHeight)
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [filtersOpen])

  // Fetch users and tickets
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const [userRes, ticketRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`),
          fetch(
            user.role === "GM" || user.role === "Manager"
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets`
              : `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/assigned-to/${user.id}`
          )
        ])

        const users: User[] = await userRes.json()
        setUsers(users);
        const rawTickets: BackendTicket[] = await ticketRes.json()

        const userMap = Object.fromEntries(users.map(u => [u.id, u.name]))
        setUsersMap(userMap)

        const processed: Ticket[] = rawTickets.map(item => ({
  id: item.id,
  title: item.name || 'Untitled Ticket',
  details: item.details || 'No details provided',   // <-- use actual ticket details
  date: item.created_at || new Date().toISOString(),
  assignedTo: userMap[item.assigned_to ?? -1] ?? 'Unassigned',
  status: item.status || 'Pending',
  category: 'General', // Placeholder, replace with actual category if available
  subCategory: item.department || 'General', // Placeholder, replace with actual subcategory if available
  otherSubCategory: null,
  email: item.email || 'System',
  createdBy: item.created_by || 'System',
  department: item.department || 'General',
  image: item.image,
  images: item.image ? [item.image] : [],

}))

setTickets(processed)

// ✅ only keep first ticket open by default
if (processed.length > 0) {
  setOpenTickets({ [processed[0].id]: true })
}

      } catch (err) {
        console.error('Failed to fetch users or tickets:', err)
      }
    }

    fetchData()
  }, [user])

  // const handleAssignTicket = async (ticketId: number, userId: number) => {
  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticketId}/assign`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ assigned_to: userId }),
  //       }
  //     )

  //     if (!res.ok) throw new Error("Failed to assign ticket")

  //     // Optimistic update
  //     setTickets((prev: Ticket[]) =>
  //       prev.map((t: Ticket) =>
  //         t.id === ticketId ? { ...t, assignedTo: usersMap[userId] } : t
  //       )
  //     )

  //     // clear local selection after save
  //     setSelectedUsers(prev => ({ ...prev, [ticketId]: "" }))
      
  //   } catch (err) {
  //     console.error("Error assigning ticket:", err)
  //   }
  // }

  const fetchComments = async (ticketId: number) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${ticketId}`)
    const data: Comment[] = await res.json()
    setComments(prev => ({ ...prev, [ticketId]: data }))
  } catch (err) {
    console.error("Failed to load comments", err)
  }
}

// const toggleCard = (id: number) => {
//   const isOpen = openTickets[id] ?? false
//   setOpenTickets(prev => ({ ...prev, [id]: !isOpen }))
//   if (!isOpen) fetchComments(id) // load comments when opened
// }


 const handleStatusChange = async (id: number) => {
  try {
    const status = statusUpdates[id];
    if (!status) return;

    // 👇 Optimistic update first
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket
      )
    );

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    setStatusUpdates((prev) => ({ ...prev, [id]: "" }));
    setMessage(`✅ Ticket ${id} updated to "${status}".`);
    setError("");
    // ✅ If resolved, send notification email
    if (status === "Resolved") {
  const ticket = tickets.find((t) => t.id === id);
  console.log("🔍 Trying to resolve ticket:", ticket);

  const assignedUser = users.find((u) => u.name === ticket?.assignedTo);
  console.log("👤 Assigned user found:", assignedUser);

  if (ticket && assignedUser) {
    await handleResolveTicket(ticket.id, assignedUser, ticket.title);
  }
}

  } catch (err) {
    console.error(err);
    setError(`❌ Failed to update ticket ${id}.`);
    setMessage("");

  }
};



  const handleAddComment = async (ticketId: number) => {
  const content = newComments[ticketId]
  if (!content?.trim()) return

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, content, isAdmin: true }),
    })

    if (!res.ok) throw new Error("Failed to post comment")

    setNewComments(prev => ({ ...prev, [ticketId]: "" }))
    await fetchComments(ticketId) // refresh after post
      router.refresh(); // ✅ Next.js 13+ client-side refresh
  } catch (err) {
    console.error("Error posting admin comment:", err)
  }
}


//   const handleReassignTicket = async (ticketId: number, userId: number) => {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticketId}/reassign`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ new_assigned_to: userId }),
//       }
//     )

//     if (!res.ok) throw new Error("Failed to reassign ticket")

//     // Optimistic update
//     setTickets((prev: Ticket[]) =>
//       prev.map((t: Ticket) =>
//         t.id === ticketId ? { ...t, assignedTo: usersMap[userId] } : t
//       )
//     )

//     setSelectedUsers(prev => ({ ...prev, [ticketId]: "" }))

//       router.refresh(); // ✅ Next.js 13+ client-side refresh
//   } catch (err) {
//     console.error("Error reassigning ticket:", err)
//   }
// }


  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFilters(prev => ({ ...prev, [name]: value }))
    },
    []
  )

  const uniqueValues = useCallback(
    (key: keyof Ticket) => Array.from(new Set(tickets.map(t => t[key] as string))),
    [tickets]
  )

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const ticketISODate = parseTicketDateToISO(ticket.date)
      if (!ticketISODate) return false
      if (filters.startDate && ticketISODate < filters.startDate) return false
      if (filters.endDate && ticketISODate > filters.endDate) return false
      if (filters.department && ticket.department !== filters.department) return false
      if (filters.status && ticket.status !== filters.status) return false
      return true
    })
  }, [tickets, filters])

  return (
    <>

    {assignMessage && <div className="toast toast-success top-20">{assignMessage}</div>}
    {message && <div className="toast toast-success top-32">{message}</div>}
    {error && <div className="toast toast-error top-32">{error}</div>}

    
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Filters */}
      <div
        ref={filterRef}
        className="fixed top-16 left-0 w-full px-4 sm:px-6 z-50 bg-white p-4 shadow-md border border-gray-200"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filter Tickets</h2>
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="text-gray-600 hover:text-gray-800"
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {filtersOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['startDate', 'endDate'].map(field => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field === 'startDate' ? 'Start Date' : 'End Date'}
                </label>
                <input
                  type="date"
                  id={field}
                  name={field}
                  value={filters[field as keyof typeof filters]}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
            {['department', 'status'].map(field => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <select
                  id={field}
                  name={field}
                  value={filters[field as keyof typeof filters]}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All {field}</option>
                  {uniqueValues(field as keyof Ticket).map(val => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: filterHeight }} />

      {/* Tickets */}
<div className="mt-8 grid grid-cols-1 gap-6">
  {filteredTickets.length === 0 ? (
    <p className="text-center text-gray-500 mt-10">
      No tickets found for selected filters.
    </p>
  ) : (
    filteredTickets.map(
      (
        { id, title, details,  email, assignedTo, status,  category, subCategory }, // ✅ include category and subCategory
        
      ) => {
        const selectedUser = selectedUsers[id] || "";
        const isOpen = openTickets[id] ?? false; // ✅ first card open by default

        const toggleCard = () => {
  setOpenTickets((prev) => {
    const next = !isOpen
    if (next) fetchComments(id) // 👈 fetch only when opening
    return { ...prev, [id]: next }
  })
}
        

        return (
          <div
            key={id}
            className="p-4 bg-white border border-gray-200 shadow-md rounded-lg"
          >
            {/* Card header - always visible */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleCard}
            >
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>

{/* Collapsible content */}
{isOpen && (
  <div className="mt-6">
    {/* Two-column grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* LEFT SIDE */}
      <div className="space-y-5">
        {[
          { label: "Category", value: category },
          { label: "Sub-Category", value: subCategory },
          { label: "Title", value: title },
          { label: "Full Description", value: details },
          { label: "Email", value: email }, //error: Cannot find name 'email'.
          { label: "Phone", value: "+234-000-000-0000" }, // 🔑 replace later
        ].map(({ label, value }) => (
          <div key={label}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </h4>
            <p className="mt-1 text-sm text-gray-800">
              {value || "Not specified"}
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-8">    

{(user?.role === "GM" || user?.role === "Manager") && (
  <div className="space-y-3">
    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {assignedTo === "Unassigned" ? "Assign Ticket" : "Reassign Ticket"}
    </h4>

    <select
      onChange={(e) =>
        setSelectedUsers((prev) => ({
          ...prev,
          [id]: e.target.value,
        }))
      }
      value={selectedUser}
      className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select a Staff</option>
      {Object.entries(usersMap).map(([uid, uname]) => (
        <option key={uid} value={uid}>
          {uname}
        </option>
      ))}
    </select>
{selectedUser && (
  <button
    onClick={async () => {
      if (assignedTo === "Unassigned") {
        // Assign
        await handleAssignUser({
          selectedTicket: id,
          selectedUser: Number(selectedUser),
          setMessage: setAssignMessage,
          tickets: tickets,
          users: users,
        });

        // 🔥 Optimistically update ticket state so button flips to Reassign
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, assignedTo: usersMap[Number(selectedUser)] }
              : t
          )
        );
      } else {
        // Reassign
        await handleReassignUser({
          selectedTicket: id,
          selectedUser: Number(selectedUser),
          setMessage: setAssignMessage,
          tickets: tickets,
          users: users,
        });

        // 🔥 Update local state after reassign as well
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, assignedTo: usersMap[Number(selectedUser)] }
              : t
          )
        );
      }

      // reset select box
      setSelectedUsers((prev) => ({ ...prev, [id]: "" }));
    }}
    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition-colors"
  >
    {assignedTo === "Unassigned" ? "Assign" : "Reassign"}
  </button>
)}

  </div>
)}

 <div className="space-y-4">
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      Update Ticket Status
    </h4>

    <div className="flex items-center gap-3">
      <select
        onChange={(e) =>
          setStatusUpdates((prev) => ({
            ...prev,
            [id]: e.target.value,
          }))
        }
        value={statusUpdates[id] || status}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
      >
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>

      {statusUpdates[id] && statusUpdates[id] !== status && (
        <button
          onClick={() => handleStatusChange(id)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          <span>Save</span>
        </button>
      )}
    </div>
  </div>


        {/* Comments section */}
<div>
  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
    Comments
  </h4>

  <div className="space-y-4 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
    {comments[id]?.length ? (
      comments[id].map(c => (
        <div
          key={c.id}
          className={`text-sm ${
            c.isAdmin ? "text-right" : "text-left"
          }`}
        >
          <p
            className={`font-semibold ${
              c.isAdmin ? "text-green-600" : "text-blue-600"
            }`}
          >
            {c.isAdmin ? "Admin" : "User"}
          </p>
          <p
            className={`mt-1 p-2 rounded-md shadow-sm inline-block ${
              c.isAdmin
                ? "bg-green-50 text-gray-700"
                : "bg-white text-gray-700"
            }`}
          >
            {c.content}
          </p>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-500 italic">No comments yet.</p>
    )}
  </div>

  <div className="mt-3 flex items-center gap-2">
    <textarea
      placeholder="Add a comment..."
      rows={2}
      value={newComments[id] || ""}
      onChange={e =>
        setNewComments(prev => ({ ...prev, [id]: e.target.value }))
      }
      className="flex-1 border rounded-lg p-2 text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
    />
    <button
      onClick={() => handleAddComment(id)}
      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition-colors"
    >
      Send
    </button>
  </div>
</div>

      </div>
    </div>
  </div>
)}


          </div>
        );
      }
    )
  )}
</div>

    </div>

    </>
  )
}

export default Page
