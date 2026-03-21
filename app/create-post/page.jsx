"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import CreatePost from "@/components/CreatePost";

export default function CreatePostPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="my-5 flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Post</BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 pt-0">
          <CreatePost />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
