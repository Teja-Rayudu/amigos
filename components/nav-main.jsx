"use client"

//import { ChevronRight } from "lucide-react";
import Link from "next/link"
import {
  Collapsible,
  // CollapsibleContent,
  // CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:px-0 py-8 group-data-[collapsible=icon]:mt-2 transition-all duration-300 ease-in-out">
      <SidebarGroupLabel className="text-base font-semibold py-3 px-4 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:overflow-hidden transition-all duration-300 ease-in-out">Platform</SidebarGroupLabel>
      <SidebarMenu className="group-data-[collapsible=icon]:space-y-2 transition-all duration-300 ease-in-out">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            //defaultOpen={item.isActive}
            className="group/collapsible">
            <SidebarMenuItem>
              {/* <CollapsibleTrigger asChild> */}
                <SidebarMenuButton 
                  asChild={!!item.url}
                  tooltip={item.title} 
                  className="cursor-pointer h-12 px-3 text-base group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:justify-center transition-all duration-300 ease-in-out"
                >
                  {item.url ? (
                    <Link href={item.url}>
                      {item.icon && <item.icon className="h-8 w-8 shrink-0 transition-all duration-300 ease-in-out" />}
                      <span className="text-base font-medium ml-3 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden transition-all duration-300 ease-in-out">{item.title}</span>
                    </Link>
                  ) : (
                    <>
                      {item.icon && <item.icon className="h-8 w-8 shrink-0 transition-all duration-300 ease-in-out" />}
                      <span className="text-base font-medium ml-3 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden transition-all duration-300 ease-in-out">{item.title}</span>
                    </>
                  )}
                  {/* <ChevronRight
                    className="ml-auto h-4 w-4 shrink-0 transition-all duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0" /> */}
                </SidebarMenuButton>
              {/* </CollapsibleTrigger> */}
              {/* <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild className="h-10 px-6 text-sm transition-all duration-300 ease-in-out">
                        <a href={subItem.url}>
                          <span className="text-sm">{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent> */}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
