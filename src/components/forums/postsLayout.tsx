"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { posts, comments } from "@/types/forums/types"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Clock,
  Send,
  X,
  ExternalLink,
  Heart,
  Loader2,
  Sparkles,
  ImageIcon,
  Smile,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PostDetailProps {
  post: posts
}

const PostDetail: React.FC<PostDetailProps> = ({ post }) => {
  const [upvotes, setUpvotes] = useState<number>(post.upvotes?.length || 0)
  const [downvotes, setDownvotes] = useState<number>(post.downvotes?.length || 0)
  const [voted, setVoted] = useState<"up" | "down" | null>(null)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<comments[]>(post.comments || [])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const commentInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    // Check if user has already voted
    if (post.upvotes?.some((upvote) => upvote.userid === "current-user-id")) {
      setVoted("up")
    } else if (post.downvotes?.some((downvote) => downvote.userid === "current-user-id")) {
      setVoted("down")
    }

    return () => clearTimeout(timer)
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

  const openImageModal = (src: string) => {
    setSelectedImage(src)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const shareImage = async () => {
    if (navigator.share && selectedImage) {
      try {
        await navigator.share({
          title: "Check out this image",
          url: selectedImage,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else if (selectedImage) {
      navigator.clipboard.writeText(selectedImage)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading post...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-50 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-full -z-50 overflow-hidden pointer-events-none">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-xl border border-accent/20 bg-card/80 backdrop-blur-sm"
      >
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
        <div className="p-4">
          <p className="mb-6 text-foreground/90">{post.caption}</p>

          {post.image && (
            <div
              className="relative mb-6 overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => {
                if (post.image) openImageModal(post.image)
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <span className="text-white text-sm font-medium">Click to view full size</span>
              </div>
              <Image
                src={post.image || "/logo.webp"}
                alt="Post content"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                width={800}
                height={600}
                unoptimized={isGif(post.image)}
              />
            </div>
          )}

          {post.plugins?.map((item, idx) => {
            if (item.type === "tenor") {
              return (
                <div
                  key={`tenor-${idx}`}
                  className="relative mb-6 overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openImageModal(item.href as string)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <span className="text-white text-sm font-medium">Click to view full size</span>
                  </div>
                  <Image
                    src={(item.href as string) || "/logo.webp"}
                    alt="GIF"
                    className="w-full transition-transform duration-500 group-hover:scale-105"
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
                  className="mb-6 overflow-hidden rounded-lg border border-border/30 bg-muted/10 transition-all duration-300 hover:bg-muted/20 hover:border-border/50"
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
                      <span className="text-xs text-muted-foreground">
                        {item.jsonData.sitename || item.jsonData.url}
                      </span>
                    </div>
                    <Link href={item.jsonData.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors duration-300" />
                    </Link>
                  </div>

                  <div className="p-3">
                    <h3 className="mb-1 text-sm font-medium text-foreground">{item.jsonData.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.jsonData.description}</p>
                  </div>

                  {item.jsonData.image && (
                    <div
                      className="relative h-60 w-full overflow-hidden cursor-pointer group"
                      onClick={() => openImageModal(item.jsonData.image)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <span className="text-white text-sm font-medium">Click to view full size</span>
                      </div>
                      <Image
                        src={item.jsonData.image || "/logo.webp"}
                        alt={item.jsonData.title || "Link preview"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        </div>

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
          </div>

          {/* Share */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
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

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeImageModal}
          >
            <motion.div
              className="relative max-w-5xl max-h-full p-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Full size"
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
                width={1200}
                height={900}
                unoptimized={isGif(selectedImage)}
              />
            </motion.div>
            <div className="absolute top-4 right-4 flex gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  shareImage()
                }}
                className="text-white bg-black/50 rounded-full p-2 backdrop-blur-sm hover:bg-primary/80 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="h-6 w-6" />
              </motion.button>
              <motion.a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white bg-black/50 rounded-full p-2 backdrop-blur-sm hover:bg-primary/80 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-6 w-6" />
              </motion.a>
              <motion.button
                onClick={closeImageModal}
                className="text-white bg-black/50 rounded-full p-2 backdrop-blur-sm hover:bg-destructive/80 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      <div className="mt-8">
        <motion.h2
          className="mb-6 text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Comments <span className="text-muted-foreground">({comments.length})</span>
        </motion.h2>

        {/* Comment Form */}
        <motion.form
          className="mb-8 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex gap-3 relative">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/50 bg-muted/20">
                <Image
                  src="/logo.webp?height=40&width=40"
                  alt="Your Avatar"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative flex-1">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full rounded-full border border-border/50 bg-background/80 backdrop-blur-sm px-4 py-2 pr-24 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                    onClick={() => {
                      // Image upload functionality would go here
                      if (commentInputRef.current) {
                        commentInputRef.current.focus()
                      }
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                    onClick={() => {
                      // Emoji picker would go here
                      if (commentInputRef.current) {
                        commentInputRef.current.focus()
                      }
                    }}
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Comments List */}
        {comments.length > 0 ? (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {comments.map((comment) => (
              <motion.div
                key={comment.commentid}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className="rounded-lg border border-border/20 bg-card/50 p-4 backdrop-blur-sm hover:bg-card/70 transition-colors duration-300"
              >
                <div className="flex gap-3">
                  <Link href={`/forums/@${comment.user.usertag}`}>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border/50 bg-muted/20 hover:border-primary/50 transition-colors duration-300">
                      <Image
                        src={comment.user.avatar || "/logo.webp?height=32&width=32"}
                        alt={`${comment.user.name}'s Avatar`}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/forums/@${comment.user.usertag}`}
                        className="font-medium hover:text-primary transition-colors duration-300"
                      >
                        {comment.user.name || comment.user.usertag}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {comment.user.name && `@${comment.user.usertag}`}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{comment.caption}</p>
                    {comment.image && (
                      <div
                        className="mt-2 overflow-hidden rounded-md cursor-pointer group"
                        onClick={() => openImageModal(comment.image || "/logo.webp")}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                          <span className="text-white text-xs font-medium">View full size</span>
                        </div>
                        <Image
                          src={comment.image || "/logo.webp"}
                          alt="Comment image"
                          width={300}
                          height={200}
                          className="max-h-60 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                          unoptimized={isGif(comment.image)}
                        />
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-4">
                      <button className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors duration-300">
                        <Heart className="h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                        <span>Like</span>
                      </button>
                      <button className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors duration-300">
                        <MessageCircle className="h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                        <span>Reply</span>
                      </button>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-6 rounded-full bg-muted/20 p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <MessageCircle className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">No comments yet</h3>
            <p className="text-muted-foreground max-w-md">Be the first to share your thoughts!</p>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
              onClick={() => commentInputRef.current?.focus()}
            >
              <Sparkles className="h-4 w-4" />
              Add Comment
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PostDetail
