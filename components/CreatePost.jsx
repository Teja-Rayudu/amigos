"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Send, Shield, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function CreatePost() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("idle"); // idle, scanning, consent-required, publishing, published, error
  const [message, setMessage] = useState("");
  const [detectedUsers, setDetectedUsers] = useState([]);
  const [postId, setPostId] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
    setStatus("idle");
    setMessage("");
    setDetectedUsers([]);
  };

  const scanAndPublish = async () => {
    if (!imagePreview) {
      setMessage("Please select an image first.");
      return;
    }

    setStatus("scanning");
    setMessage("🛡️ Deep Shield is scanning for faces...");

    try {
      // Load face-api and detect faces in the image
      const faceapi = await import("face-api.js");
      
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      
      // Load models if not already loaded
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
      }

      // Create image element for detection
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview;
      });

      // Detect faces
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        // No faces detected, publish directly
        setMessage("No faces detected. Publishing post...");
        await publishPost([], []);
        return;
      }

      // Compare detected faces against registered users
      const descriptors = detections.map(d => Array.from(d.descriptor));
      
      const detectRes = await fetch("/api/face/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptors }),
      });

      const detectData = await detectRes.json();

      if (detectData.unrecognizedFaces > 0) {
        setStatus("error");
        setMessage("🛡️ Deep Shield Blocked: Image contains unregistered faces. Consent cannot be verified.");
        return;
      }

      if (detectData.requiresConsent && detectData.matchedUsers.length > 0) {
        setDetectedUsers(detectData.matchedUsers);
        setStatus("consent-required");
        setMessage(`🛡️ Deep Shield detected ${detectData.matchedUsers.length} registered user(s). Sending verification emails...`);
        
        // Create post as pending first
        const postRes = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: imagePreview,
            caption,
            detectedFaces: detectData.matchedUsers.map(u => ({
              userId: u.userId,
              userName: u.userName,
              approved: false,
            })),
          }),
        });

        const postData = await postRes.json();
        setPostId(postData.post._id);

        // Send consent emails to detected users
        const emailRes = await fetch("/api/consent/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: postData.post._id,
            detectedUserIds: detectData.matchedUsers.map(u => u.userId),
          }),
        });

        const emailData = await emailRes.json();
        
        if (emailRes.ok) {
          if (emailData.failedCount > 0) {
            setMessage(`✉️ Verification emails sent to ${emailData.sentCount} user(s). ${emailData.failedCount} user(s) could not be notified (likely no 2FA enabled).`);
          } else {
            setMessage(`✉️ Verification emails sent to ${emailData.sentCount} user(s). They'll verify via Google Authenticator and your post will publish automatically.`);
          }
        } else {
          setMessage(`⚠️ Could not send emails, but post is ready to publish once users verify.`);
        }
      } else {
        // All faces in the image belong to the current uploader, publish directly
        await publishPost([], detections.length);
      }
    } catch (err) {
      console.error("Scan error:", err);
      setStatus("error");
      setMessage("Error during face scanning. Publishing without Deep Shield check.");
      // Fallback: publish without shield check
      await publishPost([], 0);
    }
  };

  const publishPost = async (detectedFaces, faceCount) => {
    setStatus("publishing");
    setMessage("Publishing your post...");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imagePreview,
          caption,
          detectedFaces,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("published");
        setMessage("✨ Post published successfully!");
        setImagePreview(null);
        setImageFile(null);
        setCaption("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to publish post");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setImageFile(null);
    setCaption("");
    setStatus("idle");
    setMessage("");
    setDetectedUsers([]);
    setPostId(null);
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-indigo-600" />
            Create New Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all"
          >
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-h-96 mx-auto rounded-lg shadow-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); resetForm(); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <ImagePlus className="h-16 w-16 mx-auto text-gray-400" />
                <p className="text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input
              id="caption"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              disabled={status === "scanning" || status === "publishing"}
            />
            <p className="text-xs text-muted-foreground text-right">{caption.length}/500</p>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
              status === "error" ? "bg-red-50 text-red-700 border border-red-200" :
              status === "published" ? "bg-green-50 text-green-700 border border-green-200" :
              status === "consent-required" ? "bg-amber-50 text-amber-700 border border-amber-200" :
              "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}>
              {status === "error" ? <AlertTriangle className="h-4 w-4 shrink-0" /> :
               status === "published" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> :
               status === "consent-required" ? <Shield className="h-4 w-4 shrink-0" /> :
               status === "scanning" ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> :
               <Shield className="h-4 w-4 shrink-0" />}
              {message}
            </div>
          )}

          {/* Detected Users */}
          {detectedUsers.length > 0 && status === "consent-required" && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Detected Users (Awaiting Verification):</p>
              {detectedUsers.map(user => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{user.userName}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Verification Email Sent
                  </span>
                </div>
              ))}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
                <p className="font-semibold mb-1">✉️ Emails Sent!</p>
                <p>Verification emails have been sent to the detected users. They'll verify with their Google Authenticator app, and your post will publish automatically once all users consent.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status === "published" ? (
              <Button onClick={resetForm} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
                Create Another Post
              </Button>
            ) : (
              <Button
                onClick={scanAndPublish}
                disabled={!imagePreview || status === "scanning" || status === "publishing" || status === "consent-required"}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {status === "scanning" ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
                ) : status === "publishing" ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Share Post</>
                )}
              </Button>
            )}
          </div>

          {/* Deep Shield Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Protected by Deep Shield — face consent verification
          </div>
        </CardContent>
      </Card>
    </>
  );
}
