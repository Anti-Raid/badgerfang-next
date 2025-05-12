"use client"

import type React from "react"
import { useState } from "react"
import type { users, posts } from "@/types/forums/types"
import Image from "next/image"
import PostCard from "./components/PostCard"
import { motion } from "framer-motion"
import { Users, MessageSquare, Link2, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProfileLayoutProps {
  user: users
  posts: posts[]
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ user, posts }) => {
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts")
  const [isFollowing, setIsFollowing] = useState(false)

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div
        className="relative mb-8 overflow-hidden rounded-xl border border-accent/20 bg-card/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5" />

        {/* Cover Image */}
        <div className="h-40 w-full bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-6 h-32 w-32 overflow-hidden rounded-xl border-4 border-card bg-muted/20 shadow-lg">
            <Image
              src={user.avatar || "/placeholder.svg?height=128&width=128"}
              alt={`${user.name}'s Avatar`}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Follow Button */}
          <div className="flex justify-end pt-4">
            <button
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                isFollowing
                  ? "bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>

          {/* User Info */}
          <div className="mt-12">
            <h1 className="text-2xl font-bold text-foreground">{user.name || user.usertag}</h1>
            <p className="text-muted-foreground">@{user.usertag}</p>

            {user.bio && <p className="mt-4 text-foreground/90">{user.bio}</p>}

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{user.followers?.length || 0}</span> followers
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{user.following?.length || 0}</span> following
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{posts.length}</span> posts
                </span>
              </div>
              {user.discord_id && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  <span className="text-sm">Discord linked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border/30">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("posts")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "about"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "posts" ? (
        posts.length > 0 ? (
          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            {posts.map((post) => (
              <motion.div key={post.postid} variants={itemVariants}>
                <PostCard {...post} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted/20 p-3">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No posts yet</h3>
            <p className="text-muted-foreground">{user.name || user.usertag} hasn't posted anything yet</p>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-border/30 bg-card/50 p-6">
            <h3 className="mb-4 text-lg font-medium">About {user.name || user.usertag}</h3>

            <div className="space-y-4">
              {user.bio && (
                <div>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">Bio</h4>
                  <p className="text-foreground">{user.bio}</p>
                </div>
              )}

              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Badges</h4>
                {user.badges && user.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No badges yet</p>
                )}
              </div>

              {user.discord_id && (
                <div>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">Connected Accounts</h4>
                  <div className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/10 p-2">
                    <span className="text-sm">Discord</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileLayout
