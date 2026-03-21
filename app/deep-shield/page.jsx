"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FaceRegistration from "@/components/FaceRegistration";
import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldAlert, CheckCircle2, Clock, Loader2 } from "lucide-react";

export default function DeepShieldPage() {
  const [faceStatus, setFaceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState([]);

  useEffect(() => {
    checkFaceStatus();
  }, []);

  const checkFaceStatus = async () => {
    try {
      // We'll check user profile for face registration status
      const res = await fetch("/api/face/status");
      if (res.ok) {
        const data = await res.json();
        setFaceStatus(data);
      }
    } catch (err) {
      // If endpoint doesn't exist yet, default to not registered
      setFaceStatus({ faceRegistered: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="my-5 flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <BreadcrumbItem>
              <BreadcrumbPage>Deep Shield</BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 pt-0 max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Deep Shield</h1>
                <p className="text-indigo-100">Protect your identity from unauthorized use</p>
              </div>
            </div>
            <p className="text-sm text-indigo-100 max-w-xl">
              Deep Shield uses advanced face recognition to detect when your photo is being shared.
              When someone tries to share a photo containing your face, an OTP is required for your consent.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  faceStatus?.faceRegistered 
                    ? "bg-green-100 text-green-600" 
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {faceStatus?.faceRegistered ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                </div>
                <p className="font-semibold">Face Status</p>
                <p className={`text-sm ${faceStatus?.faceRegistered ? "text-green-600" : "text-amber-600"}`}>
                  {loading ? "Checking..." : faceStatus?.faceRegistered ? "Registered ✓" : "Not Registered"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="font-semibold">Protection Level</p>
                <p className="text-sm text-indigo-600">
                  {faceStatus?.faceRegistered ? "Active" : "Inactive"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="font-semibold">Pending Requests</p>
                <p className="text-sm text-purple-600">{pendingPosts.length} pending</p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Deep Shield Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Register Your Face", desc: "Use your webcam to scan your face. Your face pattern is securely stored." },
                  { step: "2", title: "Automatic Detection", desc: "When someone uploads a photo, Deep Shield scans for registered faces." },
                  { step: "3", title: "OTP Consent", desc: "If your face is detected, an OTP is sent to you for verification." },
                  { step: "4", title: "Approve or Deny", desc: "Only when you enter the correct OTP, the photo can be shared." },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.step}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Face Registration Component */}
          <FaceRegistration />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
