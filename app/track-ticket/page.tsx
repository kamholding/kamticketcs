// app/(client)/track-ticket/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Ticket, Comment, User } from '@/app/type';
import Image from 'next/image';

export default function TrackTicketPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [openTickets, setOpenTickets] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      setTickets([]);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/tickets/by-email/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Error fetching tickets');
      let data: Ticket[] = await res.json();

      data = await Promise.all(
        data.map(async (ticket) => {
          if (ticket.assigned_to) {
            try {
              const userRes = await fetch(`${API_BASE}/users/${ticket.assigned_to}`);
              if (userRes.ok) {
                const userData: User = await userRes.json();
                return { ...ticket, assignee: userData };
              }
            } catch (err) {
              console.error(`Failed to fetch user ${ticket.assigned_to}`, err);
            }
          }
          return ticket;
        })
      );

      setTickets(data);

      // Expand all tickets initially and fetch comments
      const expanded: { [key: string]: boolean } = {};
      data.forEach((t) => {
        expanded[t.id] = true;
        fetchComments(t.id.toString());
      });
      setOpenTickets(expanded);
    } catch {
      setError('Could not fetch tickets. Please try again.');
      setTickets([]);
      setOpenTickets({});
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (ticketId: string) => {
    try {
      const res = await fetch(`${API_BASE}/comments/${ticketId}`);
      const data: Comment[] = await res.json();
      setComments((prev) => ({ ...prev, [ticketId]: data }));
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleCommentChange = (ticketId: string, value: string) => {
    setNewComments((prev) => ({ ...prev, [ticketId]: value }));
  };

  const handleAddComment = async (ticketId: string) => {
    const content = newComments[ticketId];
    if (!content?.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, content }),
      });
      if (!res.ok) throw new Error('Failed to post comment');

      setNewComments((prev) => ({ ...prev, [ticketId]: '' }));
      await fetchComments(ticketId);
    } catch (err) {
      console.error('Error posting comment', err);
    }
  };

  const toggleTicket = (id: string) => {
    setOpenTickets((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!comments[id]) fetchComments(id);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 flex flex-col items-center">
      {/* Form */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Track Your Ticket
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {loading ? 'Loading...' : 'Track Ticket'}
          </button>
        </form>
      </div>

      {/* Tickets */}
      <div className="w-full max-w-4xl space-y-6">
        {tickets.length === 0 && !loading && !error && (
          <p className="text-gray-500 dark:text-gray-400 text-center">No tickets found for this email.</p>
        )}

        {tickets.map((ticket: Ticket) => (
          <div
            key={ticket.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Assigned Staff */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-1">
                Assigned Staff
              </h4>
              {ticket.assignee ? (
                <div className="text-gray-700 dark:text-gray-200 space-y-1 text-sm">
                  <p className="font-medium">{ticket.assignee.name}</p>
                  <p>Email: {ticket.assignee.email}</p>
                  <p>Phone: {ticket.assignee.phone || 'N/A'}</p>
                </div>
              ) : (
                <p className="italic text-gray-500">Unassigned</p>
              )}
            </div>

            {/* Ticket Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => toggleTicket(ticket.id.toString())}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{ticket.title}</h3>
              {openTickets[ticket.id] ? <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-200" /> : <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-200" />}
            </div>

            {/* Ticket Body */}
            {openTickets[ticket.id] && (
              <div className="px-6 py-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Details</h4>
                  <p className="text-gray-700 dark:text-gray-200">{ticket.description}</p>
                </div>

                {/* Ticket Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Created', new Date(ticket.created_at).toLocaleString()],
                    ['Status', ticket.status],
                    ['Location', ticket.location],
                    ['Category', `${ticket.category}${ticket.subCategory ? ' > ' + ticket.subCategory : ''}`],
                  ].map(([label, value], idx) => (
                    <div key={idx}>
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">{label}</h4>
                      <p className="text-gray-700 dark:text-gray-200">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Ticket Image */}
                {ticket.image && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Image</h4>
                    <Image src={ticket.image} alt="Ticket" width={160} height={112} className="w-40 h-28 object-cover rounded-lg border dark:border-gray-700" />
                  </div>
                )}

                {/* Comments */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Comments</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {comments[ticket.id]?.map((c, i) => (
                      <div key={i} className={`flex ${c.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-3 py-2 rounded-lg text-sm max-w-xs break-words ${
                          c.isAdmin
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                        }`}>
                          {c.content}
                        </div>
                      </div>
                    ))}
                    {comments[ticket.id]?.length === 0 && <p className="text-sm text-gray-500 italic">No comments yet.</p>}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newComments[ticket.id] || ''}
                      onChange={(e) => handleCommentChange(ticket.id.toString(), e.target.value)}
                      placeholder="Add a comment"
                      className="flex-1 px-3 py-1.5 rounded border dark:bg-gray-700 dark:text-white"
                    />
                    <button onClick={() => handleAddComment(ticket.id.toString())} className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
