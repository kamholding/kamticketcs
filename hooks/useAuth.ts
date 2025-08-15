// hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile_picture?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authenticateAndFetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/protected`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!authResponse.ok) throw new Error("Unauthorized");

        const authData = await authResponse.json();
        const userId = authData?.data?.id;

        if (!userId) throw new Error("User ID not found");

        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`);
        if (!userResponse.ok) throw new Error("User data fetch failed");

        const userData: User = await userResponse.json();
        setUser(userData);
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    authenticateAndFetchUser();
  }, [router]);

  return { user, loading };
}
