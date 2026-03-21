"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, CheckCircle2, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function FaceRegistration() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle, loading-models, ready, capturing, processing, success, error
  const [message, setMessage] = useState("");
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [stream, setStream] = useState(null);

  const loadModels = useCallback(async () => {
    setStatus("loading-models");
    setMessage("Loading face detection models...");
    try {
      const faceapi = await import("face-api.js");
      
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      
      setFaceApiLoaded(true);
      setMessage("Models loaded! Click 'Start Camera' to begin.");
      setStatus("ready");
    } catch (err) {
      console.error("Model loading error:", err);
      setStatus("error");
      setMessage("Failed to load face detection models. Please refresh.");
    }
  }, []);

  useEffect(() => {
    loadModels();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setStatus("capturing");
      setMessage("Position your face in the center and click 'Capture Face'.");
    } catch (err) {
      setStatus("error");
      setMessage("Camera access denied. Please allow camera access.");
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !faceApiLoaded) return;

    setStatus("processing");
    setMessage("Detecting and analyzing your face...");

    try {
      const faceapi = await import("face-api.js");
      
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("capturing");
        setMessage("No face detected. Please position your face clearly and try again.");
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      // Send to API
      const res = await fetch("/api/face/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Face registered successfully! Deep Shield is now protecting you.");
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to register face.");
      }
    } catch (err) {
      console.error("Face capture error:", err);
      setStatus("error");
      setMessage("Error processing face. Please try again.");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" />
          <div>
            <CardTitle className="text-xl">Deep Shield Face Registration</CardTitle>
            <CardDescription className="text-indigo-100">
              Register your face to protect your photos from unauthorized sharing
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Camera View */}
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${status === "capturing" || status === "processing" ? "block" : "hidden"}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {status === "idle" || status === "loading-models" ? (
            <div className="text-center text-white space-y-3">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-400" />
              <p className="text-sm text-gray-300">Loading face detection models...</p>
            </div>
          ) : null}

          {status === "ready" ? (
            <div className="text-center text-white space-y-3">
              <Camera className="h-16 w-16 mx-auto text-indigo-400" />
              <p className="text-sm text-gray-300">Camera ready</p>
            </div>
          ) : null}

          {status === "success" ? (
            <div className="text-center text-white space-y-3 p-8">
              <div className="relative">
                <CheckCircle2 className="h-20 w-20 mx-auto text-green-400 animate-bounce" />
              </div>
              <p className="text-lg font-semibold text-green-400">Face Registered!</p>
              <p className="text-sm text-gray-300">Your face is now protected by Deep Shield</p>
            </div>
          ) : null}

          {/* Scan overlay when processing */}
          {status === "processing" && (
            <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
              <div className="border-4 border-indigo-400 rounded-full w-48 h-48 animate-pulse flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
          status === "error" ? "bg-red-50 text-red-700 border border-red-200" :
          status === "success" ? "bg-green-50 text-green-700 border border-green-200" :
          "bg-indigo-50 text-indigo-700 border border-indigo-200"
        }`}>
          {status === "error" ? <AlertCircle className="h-4 w-4 shrink-0" /> :
           status === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> :
           <ShieldCheck className="h-4 w-4 shrink-0" />}
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === "ready" && (
            <Button onClick={startCamera} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}
          {status === "capturing" && (
            <Button onClick={captureFace} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Capture & Register Face
            </Button>
          )}
          {status === "error" && (
            <Button onClick={() => { setStatus("ready"); setMessage(""); }} variant="outline" className="flex-1">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
