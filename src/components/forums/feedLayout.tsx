"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { posts } from "@/types/forums/types"
import PostCard from './components/PostCard';
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Clock, Sparkles, Zap, Flame, Dices, Loader2 } from "lucide-react"

type SortOption = "trending" | "newest" | "popular" | "random"

interface FeedLayoutProps {
  posts: posts[]
  title?: string
  description?: string
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ posts, title = "Feed", description }) => {
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [glitchTitle, setGlitchTitle] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    // Trigger glitch effect on title periodically
    const glitchInterval = setInterval(() => {
      setGlitchTitle(true)
      setTimeout(() => setGlitchTitle(false), 200)
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(glitchInterval)
    }
  }, [])

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

    // Apply tag filter if active
    if (activeFilter) {
      filteredPosts = filteredPosts.filter((post) =>
        post.flairs?.some((flair: string) => flair.toLowerCase() === activeFilter.toLowerCase()),
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
      case "random":
        return [...filteredPosts].sort(() => Math.random() - 0.5)
      default:
        return filteredPosts
    }
  }

  const sortedPosts = getSortedPosts()

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-1 bg-primary/30 animate-pulse" />
        <div className="absolute top-0 right-0 w-1/3 h-1 bg-accent/30 animate-pulse" style={{ animationDelay: "1s" }} />
        <div
          className="absolute bottom-0 left-0 w-1/4 h-1 bg-primary/30 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 right-0 w-2/3 h-1 bg-accent/30 animate-pulse"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Header */}
      <div className="mb-8 relative">
        <motion.div
          className={`text-3xl font-bold text-foreground mb-2 inline-block ${glitchTitle ? "animate-pulse" : ""}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative">
            {glitchTitle && (
              <>
                <span
                  className="absolute top-0 left-0 text-primary/80"
                  style={{ clipPath: "inset(0 0 50% 0)", transform: "translate(-2px, -2px)" }}
                >
                  {title}
                </span>
                <span
                  className="absolute top-0 left-0 text-accent/80"
                  style={{ clipPath: "inset(50% 0 0 0)", transform: "translate(2px, 2px)" }}
                >
                  {title}
                </span>
              </>
            )}
            {title}
          </span>
          <span className="ml-2 inline-block w-2 h-6 bg-primary animate-pulse" />
        </motion.div>
        {description && (
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Search and Filter */}
      <motion.div
        className="mb-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm px-12 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSortBy("newest")}
            className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              sortBy === "newest"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Clock
              className={`h-4 w-4 transition-transform duration-300 ${sortBy === "newest" ? "scale-110" : "group-hover:scale-110"}`}
            />
            Newest
          </button>
          <button
            onClick={() => setSortBy("trending")}
            className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              sortBy === "trending"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Flame
              className={`h-4 w-4 transition-transform duration-300 ${sortBy === "trending" ? "scale-110" : "group-hover:scale-110"}`}
            />
            Trending
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              sortBy === "popular"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Sparkles
              className={`h-4 w-4 transition-transform duration-300 ${sortBy === "popular" ? "scale-110" : "group-hover:scale-110"}`}
            />
            Popular
          </button>
          <button
            onClick={() => setSortBy("random")}
            className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              sortBy === "random"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Dices
              className={`h-4 w-4 transition-transform duration-300 ${sortBy === "random" ? "scale-110" : "group-hover:scale-110"}`}
            />
            Random
          </button>
        </div>
      </motion.div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      ) : sortedPosts.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.postid}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                layout
              >
                <PostCard {...post} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 rounded-full bg-muted/20 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Filter className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
          <h3 className="mb-2 text-2xl font-bold">No posts found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery
              ? "No posts match your search criteria. Try adjusting your filters or search terms."
              : "There are no posts to display. Be the first to create content!"}
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-300">
            <Zap className="h-4 w-4" />
            Create Post
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default FeedLayout
