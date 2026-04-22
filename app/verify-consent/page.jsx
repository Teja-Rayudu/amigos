"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function VerifyConsentPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");
  
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setMessage("Enter 6-digit code from your Google Authenticator");
      return;
    }

    if (!postId) {
      setMessage("Invalid verification link");
      return;
    }

    setIsVerifying(true);
    setStatus("verifying");

    try {
      const res = await fetch("/api/auth/2fa/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          postId, 
          token 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("✅ Consent verified successfully! The post can now be published.");
        setTimeout(() => {
          window.location.href = "/feed";
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Invalid verification code. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Verification failed. Please try again.");
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <CardTitle className="text-xl">Verify Consent</CardTitle>
              <p className="text-sm text-indigo-100 mt-1">Your face was detected in a photo</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {status === "idle" || status === "verifying" ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Enter the 6-digit code from your <strong>Google Authenticator</strong> app to consent to this photo being posted.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">6-Digit Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  disabled={isVerifying}
                  className="font-mono text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              {message && (
                <p className={`text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-gray-600"}`}>
                  {message}
                </p>
              )}

              <Button
                onClick={handleVerify}
                disabled={isVerifying || token.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Consent
                  </>
                )}
              </Button>
            </>
          ) : null}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  Consent Verified!
                </p>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  Verification Failed
                </p>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
              </div>
              <Button
                onClick={() => {
                  setStatus("idle");
                  setToken("");
                  setMessage("");
                }}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
