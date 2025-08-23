// src/types/ticket.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null; // better as string (e.g. "+234..."), DB often stores it as varchar
  role: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;   // keep if your API sends description
  details?: string;      // add if backend sometimes calls it details
  category?: string;
  subCategory?: string;
  otherSubCategory?: string;
  status?: string;
  department?: string;
  location?: string;
  email?: string;
  
  created_at: string;
  image?: string | null;
  images?: string[];     // add if backend can send multiple images
  assigned_to: number | null;

  // 👇 Expand for relational data
  assignee?: User | null; // populated if you join users
  createdBy?: string;     // add if backend sends creator info
}

export interface Comment {
  id: number;
  ticket_id: number;
  content: string;
  created_at: string;
  author?: string;     // keep if backend sends author name/email
  isAdmin?: boolean;   // ✅ new field you added in DB
}

// Optional: strict "backend ticket" mapping for raw SQL rows
export interface BackendTicket {
  id: number;
  name?: string;
  email?: string;
  created_at?: string;
  assigned_to?: number | null;
  status?: string;
  details?: string;
  created_by?: string;
  department?: string;
  image?: string | null;
}
