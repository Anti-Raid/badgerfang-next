"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { posts } from "@/types/forums/types"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, MessageCircle, Share2, ExternalLink, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const PostCard: React.FC<posts> = (post) => {
  const [upvotes, setUpvotes] = useState<number>(post.upvotes?.length || 0)
  const [downvotes, setDownvotes] = useState<number>(post.downvotes?.length || 0)
  const [voted, setVoted] = useState<"up" | "down" | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      velocity: { x: number; y: number }
    }>
  >([])

  useEffect(() => {
    // Check if user has already voted
    if (post.upvotes?.some((upvote) => upvote.userid === "current-user-id")) {
      setVoted("up")
    } else if (post.downvotes?.some((downvote) => downvote.userid === "current-user-id")) {
      setVoted("down")
    }
  }, [post.upvotes, post.downvotes])

  useEffect(() => {
    if (!showParticles) return

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            size: particle.size * 0.95, // Shrink particles over time
          }))
          .filter((particle) => particle.size > 0.5),
      ) // Remove small particles
    }, 50)

    // Clear particles after animation completes
    const timeout = setTimeout(() => {
      setShowParticles(false)
      setParticles([])
    }, 1500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [showParticles])

  const handleVote = (type: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation()

    // Create particles
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      size: Math.random() * 4 + 2,
      color: type === "up" ? "hsl(var(--primary))" : "hsl(var(--destructive))",
      velocity: {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6,
      },
    }))

    setParticles(newParticles)
    setShowParticles(true)

    if (voted === type) {
      setVoted(null)
      type === "up" ? setUpvotes((prev) => prev - 1) : setDownvotes((prev) => prev - 1)
    } else {
      if (voted) {
        // Switch vote
        type === "up"
          ? (setDownvotes((prev) => prev - 1), setUpvotes((prev) => prev + 1))
          : (setUpvotes((prev) => prev - 1), setDownvotes((prev) => prev + 1))
      } else {
        // New vote
        type === "up" ? setUpvotes((prev) => prev + 1) : setDownvotes((prev) => prev + 1)
      }
      setVoted(type)
    }
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const isGif = (src: string) => src?.toLowerCase().endsWith(".gif")

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-accent/20 bg-card/80 backdrop-blur-sm transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, borderColor: "hsl(var(--primary)/0.3)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 opacity-0 transition-opacity duration-500 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* User Info */}
      <div className="flex items-center justify-between border-b border-border/30 p-4">
        <Link href={`/forums/user/${post.user.usertag}`} className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/50 bg-muted/20 group-hover:border-primary/50 transition-colors duration-300">
            <Image
              src={post.user.avatar || "/logo.webp?height=40&width=40"}
              alt={`${post.user.name}'s Avatar`}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
              {post.user.name !== post.user.usertag ? post.user.name : post.user.usertag}
            </span>
            {post.user.name !== post.user.usertag && (
              <span className="text-xs text-muted-foreground">@{post.user.usertag}</span>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(post.createdat)}</span>
        </div>
      </div>

      {/* Post Content */}
      <Link href={`/forums/post/${post.postid}`} className="block p-4">
        <p className="mb-4 text-foreground/90">{post.caption}</p>

        {post.image && (
          <div className="relative mb-4 overflow-hidden rounded-lg">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post content"
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
              width={800}
              height={600}
              unoptimized={isGif(post.image)}
            />
          </div>
        )}

        {post.plugins?.map((item, idx) => {
          if (item.type === "tenor") {
            return (
              <div key={`tenor-${idx}`} className="relative mb-4 overflow-hidden rounded-lg">
                <Image
                  src={(item.href as string) || "/logo.webp"}
                  alt="GIF"
                  className="w-full transition-transform duration-500 hover:scale-105"
                  width={600}
                  height={400}
                  unoptimized
                />
              </div>
            )
          }

          if (item.type === "url" && item.jsonData) {
            return (
              <div
                key={`url-${idx}`}
                className="mb-4 overflow-hidden rounded-lg border border-border/30 bg-muted/10 transition-all duration-300 hover:bg-muted/20 hover:border-border/50"
              >
                <div className="flex items-center justify-between border-b border-border/20 p-3">
                  <div className="flex items-center gap-2">
                    {item.jsonData.favicon && (
                      <Image
                        src={item.jsonData.favicon || "/logo.webp"}
                        alt={item.jsonData.sitename || "Website"}
                        width={16}
                        height={16}
                        className="h-4 w-4 rounded-sm"
                      />
                    )}
                    <span className="text-xs text-muted-foreground">{item.jsonData.sitename || item.jsonData.url}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>

                <div className="p-3">
                  <h3 className="mb-1 text-sm font-medium text-foreground">{item.jsonData.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.jsonData.description}</p>
                </div>

                {item.jsonData.image && (
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={item.jsonData.image || "/logo.webp"}
                      alt={item.jsonData.title || "Link preview"}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      width={800}
                      height={400}
                      unoptimized={isGif(item.jsonData.image)}
                    />
                  </div>
                )}
              </div>
            )
          }

          return null
        })}
      </Link>

      {/* Vote Buttons */}
      <div className="relative flex items-center justify-between border-t border-border/30 px-4 py-3">
        {/* Particles container */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}px`,
                  top: `${particle.y}px`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  opacity: particle.size / 6,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-6">
          {/* Upvote */}
          <button
            onClick={(e) => handleVote("up", e)}
            className={`group relative flex items-center gap-2 transition-all duration-300 ${
              voted === "up" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowUp className={`h-5 w-5 transition-transform duration-300 ${voted === "up" ? "scale-110" : ""}`} />
            </motion.div>
            <span className="text-sm font-medium">{upvotes}</span>
          </button>

          {/* Downvote */}
          <button
            onClick={(e) => handleVote("down", e)}
            className={`group relative flex items-center gap-2 transition-all duration-300 ${
              voted === "down" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowDown
                className={`h-5 w-5 transition-transform duration-300 ${voted === "down" ? "scale-110" : ""}`}
              />
            </motion.div>
            <span className="text-sm font-medium">{downvotes}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/forums/post/${post.postid}`}
            className="group flex items-center gap-2 text-muted-foreground transition-all duration-300 hover:text-primary"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <MessageCircle className="h-5 w-5" />
            </motion.div>
            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
          </Link>
        </div>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(`https://yoursite.com/forums/post/${post.postid}`)
          }}
          className="group flex items-center gap-2 text-muted-foreground transition-all duration-300 hover:text-primary"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Share2 className="h-5 w-5" />
          </motion.div>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  )
}

export default PostCard
