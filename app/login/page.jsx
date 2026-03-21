"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Redirect to dashboard immediately if authenticated
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Checking authentication...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
      <p>If you are not redirected, please check your authentication status.</p>
    </div>
  );
}