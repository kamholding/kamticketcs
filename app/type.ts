export interface User {
  id: number;
  name: string;
  email: string;
  phone?: number | null;
  role: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  subCategory?: string;
  otherSubCategory?: string;
  category?: string;
  status?: string;
  department?: string;
  location?: string;
  created_at: string;
  image?: string;
  assigned_to: number | null;
  

  // 👇 Add this if API includes assignee details
  assignee?: User | null;
}

export interface Comment {
  id: number;
  ticket_id: number;
  content: string;
  created_at: string;
  author?: string;
   isAdmin?: boolean;
}
