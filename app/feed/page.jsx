"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import PostCard from "@/components/PostCard";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts?limit=50");
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Feed error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev =>
      prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
    );
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
              <BreadcrumbPage>Feed</BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 pt-0 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">Your Feed</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-2xl">📸</p>
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
            ))
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
