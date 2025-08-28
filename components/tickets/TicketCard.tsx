'use client'

import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Comment, Ticket, User } from "@/types/types"
import { handleAssignUser } from "@/components/utils/handleAssignUser"
import { handleReassignUser } from "@/components/utils/handleReassignUser"
import { useAuth } from "@/hooks/useAuth"

interface TicketCardProps {
  ticket: Ticket
  usersMap: Record<number, string>
  users: User[]
  comments: Comment[]
  newComment: string
  setNewComment: (value: string) => void
  fetchComments: (id: number) => void
  handleAddComment: (ticketId: number) => void
  handleStatusChange: (id: number) => void
  statusUpdate: string
  setStatusUpdate: (value: string) => void
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  usersMap,
  users,
  // comments,
  newComment,
  setNewComment,
  fetchComments,
  handleAddComment,
  handleStatusChange,
  statusUpdate,
  setStatusUpdate,
}) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")

  const toggleCard = () => {
    const next = !open
    setOpen(next)
    if (next) fetchComments(ticket.id)
  }

  return (
    <div className="p-4 bg-white border border-gray-200 shadow-md rounded-lg">
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleCard}
      >
        <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {/* Collapsible content */}
      {open && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-5">
            {[
              { label: "Category", value: ticket.category },
              { label: "Sub-Category", value: ticket.subCategory },
              { label: "Title", value: ticket.title },
              { label: "Full Description", value: ticket.details },
              { label: "Email", value: ticket.email },
              { label: "Phone", value: "+234-000-000-0000" },
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

          {/* RIGHT */}
          <div className="space-y-8">
            {/* Assign/Reassign */}
            {(user?.role === "GM" || user?.role === "Manager") && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {ticket.assignedTo === "Unassigned"
                    ? "Assign Ticket"
                    : "Reassign Ticket"}
                </h4>

                <select
                  onChange={(e) => setSelectedUser(e.target.value)}
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
                    onClick={() => {
                      if (ticket.assignedTo === "Unassigned") {
                        handleAssignUser({
                          selectedTicket: ticket.id,
                          selectedUser: Number(selectedUser),
                          setMessage: () => {},
                          tickets: [ticket],
                          users: users,
                        })
                      } else {
                        handleReassignUser({
                          selectedTicket: ticket.id,
                          selectedUser: Number(selectedUser),
                          setMessage: () => {},
                          tickets: [ticket],
                          users: users,
                        })
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition-colors"
                  >
                    {ticket.assignedTo === "Unassigned"
                      ? "Assign"
                      : "Reassign"}
                  </button>
                )}
              </div>
            )}

            {/* Update Status */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Update Ticket Status
              </h4>

              <div className="flex items-center gap-3">
                <select
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  value={statusUpdate || ticket.status}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {statusUpdate && statusUpdate !== ticket.status && (
                  <button
                    onClick={() => handleStatusChange(ticket.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  >
                    <span>Save</span>
                  </button>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Comments
              </h4>

              <div className="space-y-4 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                
                
               
              </div>

              <div className="mt-3 flex items-center gap-2">
                <textarea
                  placeholder="Add a comment..."
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border rounded-lg p-2 text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => handleAddComment(ticket.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketCard
