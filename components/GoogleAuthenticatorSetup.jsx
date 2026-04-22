"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle2, Loader2, KeyRound, Copy } from "lucide-react";
import QRCode from "qrcode.react";

export default function GoogleAuthenticatorSetup({ onSuccess, onSkip }) {
  const [step, setStep] = useState("loading"); // loading, setup, verify
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    generateTotpSecret();
  }, []);

  const generateTotpSecret = async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setSecret(data.secret);
        setQrCode(data.qrCode);
        setStep("setup");
      } else {
        setError(data.error || "Failed to setup Google Authenticator");
      }
    } catch (err) {
      setError("Error setting up Google Authenticator");
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyToken = async () => {
    if (!token || token.length !== 6) {
      setError("Enter 6-digit code from Google Authenticator");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("verify");
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h3 className="font-bold text-lg">Setup Google Authenticator</h3>
            <p className="text-sm text-green-100">2FA for Deep Shield</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {step === "loading" && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        )}

        {step === "setup" && (
          <>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center">
                <QRCode
                  value={qrCode}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>Scan this QR code with Google Authenticator app</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Or enter this code manually:
                </p>
              </div>

              {/* Secret Code Display */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center justify-between">
                <code className="text-sm font-mono font-bold text-amber-900 dark:text-amber-100 break-all">
                  {secret}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 ml-2 shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>💡 Tip:</strong> Save your backup codes in a safe place.
                </p>
              </div>

              {/* Token Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter 6-digit code from your authenticator:
                </label>
                <Input
                  placeholder="000000"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  className="font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                />
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={verifyToken}
                  disabled={verifying || token.length !== 6}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
                <Button
                  onClick={onSkip}
                  variant="outline"
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "verify" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                Setup Successful!
              </p>
              <p className="text-sm text-muted-foreground">
                Google Authenticator is now enabled for your account
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
