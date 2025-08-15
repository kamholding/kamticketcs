'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TrackTicketPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openTickets, setOpenTickets] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
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
      const url = `${API_BASE}/tickets/by-email/${encodeURIComponent(email)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error fetching tickets: ${response.status}`);
      const data = await response.json();
      setTickets(data);

      const expandedMap: { [key: string]: boolean } = {};
      data.forEach((ticket: any) => {
        expandedMap[ticket.id] = true;
        fetchComments(ticket.id);
      });
      setOpenTickets(expandedMap);
    } catch (err) {
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
      const data = await res.json();
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
      // Post comment
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, content }),
      });

      if (!res.ok) throw new Error('Failed to post comment');

      setNewComments((prev) => ({ ...prev, [ticketId]: '' }));
      await fetchComments(ticketId);

      // Fetch ticket info
      const ticketRes = await fetch(`${API_BASE}/tickets/${ticketId}`);
      const ticketData = await ticketRes.json();

      const assigneeName = ticketData?.assignee?.name || 'Assignee';
      const assigneeEmail = ticketData?.assignee?.email || 'tosinolororo2000@gmail.com';
      const commenterName = email;
      const ticketTitle = ticketData?.title || 'Untitled Ticket';
      const ticketLink = `${window.location.origin}/dashboard/tickets/${ticketId}`;

      // Send email
      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Support Bot', address: 'no-reply@yourapp.com' },
          reciepients: [{ name: assigneeName, address: assigneeEmail }],
          subject: `New comment on ticket: ${ticketTitle}`,
          template: 'ticket_comment',
          templateData: {
            assigneeName,
            commenterName,
            ticketTitle,
            comment: content,
            ticketLink,
          },
        }),
      });
    } catch (err) {
      console.error('Error posting comment or sending email', err);
    }
  };

  const toggleTicket = (id: string) => {
    const nextState = !openTickets[id];
    setOpenTickets((prev) => ({ ...prev, [id]: nextState }));
    if (nextState && !comments[id]) fetchComments(id);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4 py-8">
      {/* Form */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Track Your Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            {loading ? 'Loading...' : 'Track Ticket'}
          </button>
        </form>
      </div>

      {/* Tickets */}
      <div className="w-full max-w-4xl">
        {tickets.length === 0 && !loading && !error && (
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">No tickets found for this email.</p>
        )}

        <div className="grid grid-cols-1 gap-6">
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">{ticket.title}</h3>
                <button onClick={() => toggleTicket(ticket.id)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
                  {openTickets[ticket.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {openTickets[ticket.id] && (
                <div className="px-6 py-4 space-y-6">
                  {/* Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Details</h4>
                    <p className="text-base text-gray-700 dark:text-gray-200">{ticket.details}</p>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                      ['Created', new Date(ticket.created_at).toLocaleString()],
                      ['Status', ticket.status],
                      ['Department', ticket.department],
                      ['Location', ticket.location],
                      ['Category', `${ticket.category}${ticket.subCategory ? ' > ' + ticket.subCategory : ''}`],
                    ].map(([label, value], idx) => (
                      <div key={idx}>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">{label}</h4>
                        <p className="text-gray-700 dark:text-gray-200">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Image */}
                  {ticket.image && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Image</h4>
                      <img
                        src={ticket.image}
                        alt="Ticket"
                        className="w-40 h-28 object-cover rounded-lg border dark:border-gray-700"
                      />
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Comments</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {comments[ticket.id]?.map((c, i) => (
                        <div
                          key={i}
                          className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded"
                        >
                          {c.content}
                        </div>
                      ))}
                      {comments[ticket.id]?.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No comments yet.</p>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newComments[ticket.id] || ''}
                        onChange={(e) => handleCommentChange(ticket.id, e.target.value)}
                        placeholder="Add a comment"
                        className="flex-1 px-3 py-1.5 rounded border dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddComment(ticket.id)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                      >
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
    </div>
  );
}
