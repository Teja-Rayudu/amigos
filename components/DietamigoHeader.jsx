"use client";

import React from "react";
import { Nunito } from "next/font/google";
import { Shield } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Import Nunito with ExtraBold
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["800"], // ExtraBold
});

const AmigosHeader = ({ showPlan = false, size = "lg" }) => {
  return (
    <SidebarMenu className="my-5">
      <SidebarMenuItem>
        <SidebarMenuButton 
          size="lg" 
          tooltip="AMIGOS" 
          asChild
          className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:justify-center transition-all duration-300 ease-in-out"
        >
          <Link href="/dashboard" aria-label="Go to Dashboard - AMIGOS">
            {/* Logo Icon */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex aspect-square size-12 items-center justify-center rounded-xl shrink-0 shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            
            {/* Text Logo */}
            <div className="grid flex-1 text-left leading-tight ml-3 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden transition-all duration-300 ease-in-out">
              <h1
                className={`${nunito.className} truncate font-medium text-sidebar-foreground`}
                style={{
                  fontWeight: 800,
                  fontSize: "28px",
                  letterSpacing: "1px",
                }}
              >
                <span className="text-sidebar-foreground">AM</span>
                <span style={{ color: "#4F46E5" }}>I</span>
                <span className="text-sidebar-foreground">GOS</span>
              </h1>
              {showPlan && (
                <span className="truncate text-xs text-muted-foreground">Deep Shield Protected</span>
              )}
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AmigosHeader;