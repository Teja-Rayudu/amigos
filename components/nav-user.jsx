"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={session?.user?.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:justify-center transition-all duration-300 ease-in-out"
            >
              <Avatar className="h-8 w-8 rounded-lg shrink-0 transition-all duration-300 ease-in-out">
                <AvatarImage src={user?.avatar} alt={session?.user?.name || user?.name} />
                <AvatarFallback className="rounded-lg text-sm transition-all duration-300 ease-in-out">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CN'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-base leading-tight ml-3 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden transition-all duration-300 ease-in-out">
                <span className="truncate font-semibold text-base">
                  {session?.user?.name}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-all duration-300 ease-in-out" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={session?.user?.name || user?.name || 'User'} />
                  <AvatarFallback className="rounded-lg text-base">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CN'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">
                    {session?.user?.name || user?.name || 'User'}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {session?.user?.email || user?.email || ''}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/account" className="flex items-center">
                  <BadgeCheck />
                  Account
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="h-4 w-4" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// export default function UserInfo() {
//   const { data: session } = useSession();

//   return (
//     <div className="grid place-items-center h-screen">
//       <div className="shadow-lg p-8 bg-zinc-300/10 flex flex-col gap-2 my-6 rounded-lg">
//         <div>
//           Name: <span className="font-bold">{session?.user?.name}</span>
//         </div>
//         <div>
//           Email: <span className="font-bold">{session?.user?.email}</span>
//         </div>
//         <button
//           onClick={() => signOut()}
//           className="bg-red-500 text-white font-bold px-6 py-2 mt-3"
//         >
//           Log Out
//         </button>
//       </div>
//     </div>
//   );
// }
