"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { User, Save, Loader2, CheckCircle2, AlertCircle, Camera, Trash2 } from "lucide-react";

export default function AccountProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Load user profile and posts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile', { credentials: 'same-origin' });
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile({
              name: data.profile.name || "",
              email: data.profile.email || "",
              phone: data.profile.phone || "",
              bio: data.profile.bio || "",
              avatar: data.profile.avatar || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadMyPosts = async () => {
      try {
        const response = await fetch('/api/posts/me', { credentials: 'same-origin' });
        if (response.ok) {
          const data = await response.json();
          if (data.posts) {
            setMyPosts(data.posts);
          }
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadProfile();
    loadMyPosts();
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
    setSuccess(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      handleChange("avatar", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      if (!profile.name.trim()) {
        setError("Name cannot be empty.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'same-origin',
        body: JSON.stringify({
          profile: {
            name: profile.name.trim(),
            phone: profile.phone.trim(),
            bio: profile.bio.trim(),
            avatar: profile.avatar,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save profile");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An error occurred while saving.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (response.ok) {
        setMyPosts(prev => prev.filter(post => post._id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the post.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Update your public profile and manage your uploads.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-gray-200 dark:border-gray-800">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div 
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-950 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              <div className="text-center sm:text-left pt-2 sm:pt-4">
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="mt-1">{profile.email}</CardDescription>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  Change Picture
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Profile updated successfully!
              </div>
            )}

            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  maxLength={60}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Your phone number"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself"
                  className="resize-none h-24"
                  value={profile.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {profile.bio.length}/200
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* My Posts Section */}
      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">My Posts</h2>
        <p className="text-muted-foreground text-sm">
          Review and manage all your uploaded posts.
        </p>

        {loadingPosts ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : myPosts.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-gray-50/50 dark:bg-gray-900/20 text-muted-foreground">
            You haven't uploaded any posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPosts.map((post) => (
              <div key={post._id} className="relative group rounded-lg overflow-hidden border bg-background shadow-sm aspect-square">
                <img 
                  src={post.imageUrl} 
                  alt={post.caption || "Post"} 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Status Badge & Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                  {post.caption && (
                    <p className="text-xs text-white/90 line-clamp-2">
                      {post.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

