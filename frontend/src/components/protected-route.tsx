"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;

    const checkAuth = () => {
      // Try multiple methods to get the token
      let token: string | undefined = Cookies.get("token");
      if (!token) {
        // Fallback to document.cookie
        token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
      }
      if (!token && typeof window !== "undefined") {
        // Fallback to localStorage
        const localToken = localStorage.getItem("token");
        token = localToken || undefined;
      }

      console.log(
        `ProtectedRoute: Checking authentication (attempt ${
          retryCount + 1
        }), token:`,
        token ? "present" : "missing"
      );

      if (!token && retryCount < maxRetries) {
        // Retry after a short delay, token might still be setting
        retryCount++;
        setTimeout(checkAuth, 100);
        return;
      }

      if (!token) {
        // No token found after retries, redirect to sign-in
        console.log(
          "ProtectedRoute: No token found after retries, redirecting to sign-in"
        );
        router.push("/sign-in");
        setIsAuthenticated(false);
      } else {
        // Token found, user is authenticated
        const method = Cookies.get("token")
          ? "js-cookie"
          : document.cookie.includes("token=")
          ? "document.cookie"
          : "localStorage";
        console.log(
          "ProtectedRoute: Token found via",
          method,
          "- user authenticated"
        );
        setIsAuthenticated(true);
      }
    };

    // Start checking immediately, then retry if needed
    checkAuth();
  }, [router]); // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}
