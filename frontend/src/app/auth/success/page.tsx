"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token in cookie
      Cookies.set("token", token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      setStatus("success");

      // Redirect to chat after a short delay
      setTimeout(() => {
        router.push("/chat");
      }, 2000);
    } else {
      setStatus("error");

      // Redirect to sign-in after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === "loading" && (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Processing authentication...</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Success!</h1>
            <p className="text-gray-600">
              You have been successfully signed in.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to home page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600">There was an error signing you in.</p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to sign-in page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
