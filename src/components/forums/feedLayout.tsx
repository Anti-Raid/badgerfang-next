"use client"

import type React from "react"
import { useState } from "react"
import type { posts } from "@/types/forums/types"
import PostCard from "./components/PostCard"
import { motion } from "framer-motion"
import { Search, Filter, TrendingUp, Clock, Sparkles } from "lucide-react"

type SortOption = "trending" | "newest" | "popular"

interface FeedLayoutProps {
  posts: posts[]
  title?: string
  description?: string
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ posts, title = "Feed", description }) => {
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [searchQuery, setSearchQuery] = useState("")

  const getSortedPosts = () => {
    let filteredPosts = [...posts]

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.caption.toLowerCase().includes(query) ||
          post.user.name?.toLowerCase().includes(query) ||
          post.user.usertag.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "trending":
        return filteredPosts.sort(
          (a, b) =>
            (b.upvotes?.length || 0) -
            (b.downvotes?.length || 0) -
            ((a.upvotes?.length || 0) - (a.downvotes?.length || 0)),
        )
      case "newest":
        return filteredPosts.sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())
      case "popular":
        return filteredPosts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
      default:
        return filteredPosts
    }
  }

  const sortedPosts = getSortedPosts()

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy("newest")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortBy === "newest"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Newest
          </button>
          <button
            onClick={() => setSortBy("trending")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortBy === "trending"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Trending
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortBy === "popular"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Popular
          </button>
        </div>
      </div>

      {/* Posts */}
      {sortedPosts.length > 0 ? (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {sortedPosts.map((post) => (
            <PostCard key={post.postid} {...post} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted/20 p-3">
            <Filter className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No posts found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "No posts match your search criteria" : "There are no posts to display"}
          </p>
        </div>
      )}
    </div>
  )
}

export default FeedLayout
