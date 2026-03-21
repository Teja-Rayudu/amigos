"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Users, UserPlus, UserMinus, Loader2, Shield, UserCheck, UserX } from "lucide-react";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("my-friends");
  
  const [friends, setFriends] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (activeTab === "my-friends") fetchFriends();
    if (activeTab === "find-friends") fetchSuggestedUsers();
    if (activeTab === "requests") fetchFriendRequests();
  }, [activeTab]);

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      if (res.ok) setFriends(data.friends || []);
    } catch (err) {
      console.error("Friends error:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    setLoadingSuggested(true);
    try {
      const res = await fetch("/api/friends/users");
      const data = await res.json();
      if (res.ok) setSuggestedUsers(data.users || []);
    } catch (err) {
      console.error("Suggested error:", err);
    } finally {
      setLoadingSuggested(false);
    }
  };

  const fetchFriendRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/friends/requests");
      const data = await res.json();
      if (res.ok) setFriendRequests(data.requests || []);
    } catch (err) {
      console.error("Requests error:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await fetch(`/api/friends?friendId=${friendId}`, { method: "DELETE" });
      setFriends(prev => prev.filter(f => f._id !== friendId));
    } catch (err) {
      console.error("Remove friend error:", err);
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        setSuggestedUsers(prev => prev.filter(u => u._id !== targetUserId));
      }
    } catch (err) {
      console.error("Send request error:", err);
    }
  };

  const respondToRequest = async (fromUserId, accept) => {
    try {
      const res = await fetch(`/api/friends/requests?fromUserId=${fromUserId}`, {
        method: accept ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: accept ? JSON.stringify({ fromUserId }) : undefined
      });
      if (res.ok) {
        setFriendRequests(prev => prev.filter(r => r.from._id !== fromUserId));
      }
    } catch (err) {
      console.error("Respond request error:", err);
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
              <BreadcrumbPage>Friends</BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6 pt-0 max-w-4xl mx-auto w-full">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              Connections
            </h1>
            <p className="text-muted-foreground">Manage your AMIGOS network and grow your friends list.</p>
          </div>

          <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 pb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab("my-friends")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors shrink-0 ${activeTab === "my-friends" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              My Friends
            </button>
            <button
              onClick={() => setActiveTab("find-friends")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors shrink-0 ${activeTab === "find-friends" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              Find Friends 
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 shrink-0 ${activeTab === "requests" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              Friend Requests
            </button>
          </div>

          <Card className="border-t-0 rounded-tl-none shadow-sm">
            <CardContent className="pt-6">
              {/* MY FRIENDS TAB */}
              {activeTab === "my-friends" && (
                <div>
                  <CardTitle className="text-xl mb-4">Your Friends ({friends.length})</CardTitle>
                  {loadingFriends ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed">
                      <Users className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-muted-foreground">You don't have any friends yet.</p>
                      <Button variant="outline" onClick={() => setActiveTab("find-friends")}>Find people to connect with</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {friends.map(friend => (
                        <div key={friend._id} className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-950 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                              {friend.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{friend.name}</p>
                              {friend.faceRegistered && (
                                <div className="flex items-center gap-1 text-xs text-indigo-600 mt-1">
                                  <Shield className="h-3 w-3" /> Protected
                                </div>
                              )}
                            </div>
                          </div>
                          <Button onClick={() => removeFriend(friend._id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full">
                            <UserMinus className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FIND FRIENDS TAB */}
              {activeTab === "find-friends" && (
                <div>
                  <CardTitle className="text-xl mb-1">Discover People</CardTitle>
                  <CardDescription className="mb-4">Send requests to connect with others on AMIGOS.</CardDescription>
                  {loadingSuggested ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                  ) : suggestedUsers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed text-muted-foreground">
                      No new users found to connect with.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {suggestedUsers.map(user => (
                        <div key={user._id} className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-950 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user.bio || "No bio yet"}</p>
                            </div>
                          </div>
                          <Button onClick={() => sendFriendRequest(user._id)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4">
                            <UserPlus className="h-4 w-4 mr-2" /> Add 
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FRIEND REQUESTS TAB */}
              {activeTab === "requests" && (
                <div>
                  <CardTitle className="text-xl mb-1">Pending Requests</CardTitle>
                  <CardDescription className="mb-4">People who want to connect with you.</CardDescription>
                  {loadingRequests ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                  ) : friendRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed text-muted-foreground">
                      You have no pending friend requests.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {friendRequests.map(req => (
                        <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-950 shadow-sm gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                              {req.from.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-base">{req.from.name}</p>
                              <p className="text-xs text-muted-foreground">Sent a request on {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button onClick={() => respondToRequest(req.from._id, true)} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white">
                              <UserCheck className="h-4 w-4 mr-2" /> Accept
                            </Button>
                            <Button onClick={() => respondToRequest(req.from._id, false)} variant="outline" className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 border-red-200">
                              <UserX className="h-4 w-4" /> Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
