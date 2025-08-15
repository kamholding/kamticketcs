'use client'
import Image from "next/image"; // ✅ add this at the top

import React, { useState, useEffect, ChangeEvent, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type Ticket = {
  id: number
  title: string
  details: string
  date: string
  assignedTo: string
  status: string
  createdBy: string
  department: string
  image?: string
  images?: string[]
}

type User = {
  id: number
  name: string
}

type BackendTicket = {
  id: number
  name?: string
  email?: string
  created_at?: string
  assigned_to?: number
  status?: string
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

  // ✅ Restrict non-Superadmin users
  useEffect(() => {
    if (!user) return
    if (user.role !== 'Superadmin') router.push('/unauthorized')
  }, [user, router])

  const [usersMap, setUsersMap] = useState<Record<number, string>>({})
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [openTickets, setOpenTickets] = useState<Record<number, boolean>>({})
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [filters, setFilters] = useState({ startDate: '', endDate: '', department: '', status: '' })
  const filterRef = useRef<HTMLDivElement>(null)
  const [filterHeight, setFilterHeight] = useState(0)

  // 🛠️ Combined resize + height update in one function
  useEffect(() => {
    const updateHeight = () => filterRef.current && setFilterHeight(filterRef.current.offsetHeight)
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [filtersOpen])

  // 🛠️ Fetching Users & Tickets in Parallel for Speed
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, ticketRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets`)
        ])

        const users: User[] = await userRes.json()
        const rawTickets: BackendTicket[] = await ticketRes.json()

        const userMap = Object.fromEntries(users.map(u => [u.id, u.name]))
        setUsersMap(userMap)

        const processed = rawTickets.map(item => ({
          id: item.id,
          title: item.name || 'Untitled Ticket',
          details: item.email || 'No details provided',
          date: item.created_at || new Date().toISOString(),
          assignedTo: userMap[item.assigned_to ?? -1] ?? 'Unassigned',
          status: item.status || 'Pending',
          createdBy: item.created_by || 'System',
          department: item.department || 'General',
          image: item.image,
          images: item.image ? [item.image] : [],
        }))

        setTickets(processed)
        setOpenTickets(Object.fromEntries(processed.map(t => [t.id, true])))
      } catch (err) {
        console.error('Failed to fetch users or tickets:', err)
      }
    }
    fetchData()
  }, [])

  // 🛠️ useCallback to prevent unnecessary re-renders in children
  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFilters(prev => ({ ...prev, [name]: value }))
    },
    []
  )

  // 🛠️ Memoize derived values
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

  const toggleTicket = useCallback(
    (id: number) => setOpenTickets(prev => ({ ...prev, [id]: !prev[id] })),
    []
  )

  if (!user || user.role !== 'Superadmin') {
    return <div className="text-center text-gray-600 mt-20">Loading or unauthorized access...</div>
  }

  return (
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
          <p className="text-center text-gray-500 mt-10">No tickets found for selected filters.</p>
        ) : (
          filteredTickets.map(({ id, title, details, date, assignedTo, status, createdBy, department, images }) => (
            <div key={id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <button onClick={() => toggleTicket(id)} className="text-gray-500 hover:text-gray-700">
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
                    {[
                      ['Date', date],
                      ['Assigned To', assignedTo],
                      ['Status', status],
                      ['Created By', createdBy],
                      ['Department', department],
                    ].map(([label, value], i) => (
                      <div key={i}>
                        <h4 className="text-sm font-semibold text-gray-500">{label}</h4>
                        <p className="text-gray-700">{value}</p>
                      </div>
                    ))}
                  </div>
                  {images?.length ? ( // ✅ safe check for length
  <div>
    <h4 className="text-sm font-semibold text-gray-500">Images</h4>
    <div className="flex space-x-4 overflow-x-auto py-2">
      {images?.length ? (
  <div>
    <h4 className="text-sm font-semibold text-gray-500">Images</h4>
    <div className="flex space-x-4 overflow-x-auto py-2">
      {(images ?? []).map((imgUrl, idx) => (
        <div key={idx} className="relative w-32 h-24 flex-shrink-0">
          <Image
            src={imgUrl}
            alt={`Ticket Image ${idx + 1}`}
            fill
            className="object-cover rounded-lg"
            sizes="128px" // ✅ optimize for your container size
            priority={idx === 0} // ✅ preload first image
          />
        </div>
      ))}
    </div>
  </div>
) : null}

    </div>
  </div>
) : null}

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Page
