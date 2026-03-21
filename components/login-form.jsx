"use client"

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      if (res?.ok) {
        router.replace("/dashboard");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Login exception:", error);
      }
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome to AMIGOS</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Sign in to connect with friends & share moments
        </p>
      </div>
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <Button 
          type="submit" 
          className="cursor-pointer w-full text-white bg-indigo-600 hover:bg-indigo-500"
        >
          Sign In
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline underline-offset-4 text-indigo-600">Register</Link>
      </div>
    </form>
  )
}