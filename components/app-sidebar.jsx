"use client"

import * as React from "react"
import {
  ImagePlus,
  Rss,
  Users,
  Shield,
  UserCircle,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import AmigosHeader from "@/components/DietamigoHeader"
import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "Feed",
    url: "/feed",
    icon: Rss,
  },
  {
    title: "Create Post",
    url: "/create-post",
    icon: ImagePlus,
  },
  {
    title: "Friends",
    url: "/friends",
    icon: Users,
  },
  {
    title: "Deep Shield",
    url: "/deep-shield",
    icon: Shield,
  },
  {
    title: "Account",
    url: "/account",
    icon: UserCircle,
  },
]

export function AppSidebar({
  ...props
}) {
  const { data: session } = useSession();

  const user = session?.user ? {
    name: session.user.name || 'User',
    email: session.user.email || '',
    avatar: session.user.image || undefined,
  } : {
    name: 'Guest',
    email: '',
    avatar: undefined,
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="transition-all duration-300 slide-out-to-end-translate-full transform-gpu will-change-transform"
      {...props}
    >
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pb-1 transition-all duration-700 ease-out">
        <AmigosHeader showPlan={true} />
      </SidebarHeader>
      <SidebarContent className="p-4 group-data-[collapsible=icon]:p-0 transition-all duration-700 ease-out">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pt-1 transition-all duration-700 ease-out">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
