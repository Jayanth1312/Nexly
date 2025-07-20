"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/sign-in");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          There was an error during the authentication process. This could be
          due to:
        </p>
        <ul className="text-left text-gray-600 mb-6 space-y-2">
          <li>• Cancelled authentication</li>
          <li>• Network connection issues</li>
          <li>• Invalid OAuth configuration</li>
          <li>• Server temporarily unavailable</li>
        </ul>
        <div className="space-y-3">
          <Link
            href="/sign-in"
            className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors"
          >
            Try Again
          </Link>
          <p className="text-sm text-gray-500">
            Automatically redirecting in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
