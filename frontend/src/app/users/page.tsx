"use client";

import { fetchUsers } from "@/actions/users";
import { User } from "./schema";
import { UsersClient } from "./users-client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          (process.env.NEXT_PUBLIC_API_BASE_URL ||
            "http://localhost:4000/api") + "/users?page=1&limit=1000",
          { credentials: "include" } // only if you actually need cookies/session
        );
        console.log("res", res);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setUsers(data.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!isClient) {
    return null;
  }
  if (loading) return <div>Loading...</div>;
  if (!users.length) return <div>No Users Found</div>;

  return <UsersClient initialUsers={users} />;
}
