// types/types.ts

export type Comment = {
  id: number;
  ticket_id: number;
  content: string;
  created_at: string;
  author?: string;
  isAdmin?: boolean;
};

export type Ticket = {
  id: number;
  title: string;
  details: string;
  date: string;
  assignedTo: string;
  status: string;
  category: string;
  subCategory: string;
  otherSubCategory?: string | null;
  createdBy: string;
  department: string;
  image?: string;
  images?: string[];
  email: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type BackendTicket = {
  id: number;
  name?: string;
  email?: string;
  created_at?: string;
  assigned_to?: number;
  status?: string;
  details?: string;
  created_by?: string;
  department?: string;
  image?: string;
};

// ✅ Add this for handleReassignUser
export type HandleReassignUserParams = {
  selectedTicket: number | undefined;
  selectedUser: number | undefined;
  setMessage: (msg: string) => void;
  tickets: Ticket[];
  users: User[];
};
