"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const Logo = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="48"
    viewBox="0 0 40 48"
    width="40"
    {...props}
  >
    <clipPath id="a">
      <path d="m0 0h40v48h-40z" />
    </clipPath>
    <g clipPath="url(#a)">
      <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
      <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
      <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
      <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
      <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
      <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
    </g>
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    try {
      await authService.requestPasswordReset(email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(
        error.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        {/* Theme Toggle - Bottom Right */}
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex items-center space-x-1.5 justify-center mb-8">
              <Logo
                className="h-7 w-7 text-foreground dark:text-foreground"
                aria-hidden={true}
              />
              <p className="font-medium text-lg text-foreground dark:text-foreground">
                Nexly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-4">
                Check Your Email
              </h2>

              <p className="text-muted-foreground dark:text-muted-foreground mb-6">
                We've sent a password reset link to{" "}
                <span className="font-medium text-foreground dark:text-foreground">
                  {email}
                </span>
              </p>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <Mail className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    Email sent successfully!
                  </p>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  The reset link will expire in 10 minutes. Don't see the email?
                  Check your spam folder.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>

                <Link
                  href="/sign-in"
                  className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {/* Theme Toggle - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center space-x-1.5 justify-center mb-8">
            <Logo
              className="h-7 w-7 text-foreground dark:text-foreground"
              aria-hidden={true}
            />
            <p className="font-medium text-lg text-foreground dark:text-foreground">
              Nexly
            </p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">
              Forgot your password?
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground">
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mt-2"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
