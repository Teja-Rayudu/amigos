"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle2, X, Loader2, KeyRound } from "lucide-react";

export default function TOTPVerificationModal({ detectedUsers, postId, onVerified, onClose }) {
  const [totpInputs, setTotpInputs] = useState({});
  const [verifying, setVerifying] = useState({});
  const [errors, setErrors] = useState({});
  const [verifiedUsers, setVerifiedUsers] = useState({});

  const handleTotpChange = (userId, value) => {
    setTotpInputs(prev => ({ ...prev, [userId]: value }));
    if (errors[userId]) {
      setErrors(prev => ({ ...prev, [userId]: "" }));
    }
  };

  const verifyTotp = async (userId) => {
    const totp = totpInputs[userId];
    if (!totp || totp.length !== 6) {
      setErrors(prev => ({ ...prev, [userId]: "Enter 6-digit code from authenticator" }));
      return;
    }

    setVerifying(prev => ({ ...prev, [userId]: true }));

    try {
      const res = await fetch("/api/auth/2fa/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId, token: totp }),
      });

      const data = await res.json();

      if (res.ok) {
        setVerifiedUsers(prev => ({ ...prev, [userId]: true }));
        onVerified(userId);
      } else {
        setErrors(prev => ({ ...prev, [userId]: data.error || "Invalid code" }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [userId]: "Verification failed" }));
    } finally {
      setVerifying(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h3 className="font-bold text-lg">Deep Shield Consent</h3>
                <p className="text-sm text-indigo-100">Google Authenticator required</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            The following users&apos; faces were detected in your photo. Enter the 6-digit code from their Google Authenticator to get their consent.
          </p>

          {detectedUsers.map(user => {
            const isVerified = verifiedUsers[user.userId];

            return (
              <div key={user.userId} className={`p-4 rounded-xl border transition-all ${
                isVerified 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {user.userName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{user.userName}</span>
                  </div>
                  {isVerified && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {!isVerified && (
                  <>
                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <KeyRound className="h-3 w-3" />
                        Open your Google Authenticator app
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        value={totpInputs[user.userId] || ""}
                        onChange={(e) => handleTotpChange(user.userId, e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="font-mono text-center tracking-widest"
                        maxLength={6}
                      />
                      <Button
                        onClick={() => verifyTotp(user.userId)}
                        disabled={verifying[user.userId]}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
                      >
                        {verifying[user.userId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    {errors[user.userId] && (
                      <p className="text-xs text-red-500 mt-1">{errors[user.userId]}</p>
                    )}
                  </>
                )}

                {isVerified && (
                  <p className="text-xs text-green-600 dark:text-green-400">✓ Consent verified with Google Authenticator</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
