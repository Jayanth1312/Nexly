"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import SignIn from "@/components/signIn";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by looking for auth token
    const token = Cookies.get("token");

    if (token) {
      // User is authenticated, redirect to chat
      router.push("/chat");
    }
  }, [router]);

  return <SignIn />;
}
