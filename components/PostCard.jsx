"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Shield } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PostCard({ post, onUpdate }) {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isLiked = post.likes?.includes(session?.user?.id);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      const data = await res.json();
      if (res.ok && onUpdate) {
        onUpdate(data.post);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", text: commentText }),
      });
      const data = await res.json();
      if (res.ok && onUpdate) {
        onUpdate(data.post);
        setCommentText("");
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.author?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{post.author?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
        </div>
        {post.detectedFaces?.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-full">
            <Shield className="h-3 w-3" />
            Protected
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative">
        <img
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          className="w-full max-h-[500px] object-cover"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1 transition-colors hover:text-red-500"
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="text-sm font-medium">{post.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 transition-colors hover:text-indigo-500"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-1">{post.author?.name}</span>
            {post.caption}
          </p>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 pt-2 border-t">
            {post.comments?.map((comment, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold mr-1">{comment.userName}</span>
                {comment.text}
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                className="text-sm"
              />
              <Button
                onClick={handleComment}
                disabled={isCommenting || !commentText.trim()}
                size="sm"
                variant="ghost"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
