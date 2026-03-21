"use client";

import React from "react";
import { Nunito } from "next/font/google";
import Link from "next/link";
import { Shield } from "lucide-react";

// Import Nunito with ExtraBold
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["800"], // ExtraBold
});

const SimpleHeader = ({ showPlan = false }) => {
  return (
    <Link href="/dashboard" aria-label="Go to Dashboard - AMIGOS" className="flex items-center gap-3 cursor-pointer group">
      {/* Logo Icon */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex aspect-square size-12 items-center justify-center rounded-xl shrink-0 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 shadow-lg">
        <Shield className="w-7 h-7" />
      </div>
      
      {/* Text Logo */}
      <div className="flex flex-col">
        <h1
          className={`${nunito.className} font-medium`}
          style={{
            fontWeight: 800,
            fontSize: "28px",
            letterSpacing: "1px",
          }}
        >
          <span className="text-foreground">AM</span>
          <span style={{ color: "#4F46E5" }}>I</span>
          <span className="text-foreground">GOS</span>
        </h1>
        {showPlan && (
          <span className="text-xs text-muted-foreground">Deep Shield Protected</span>
        )}
      </div>
    </Link>
  );
};

export default SimpleHeader;