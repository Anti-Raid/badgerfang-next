"use client"

import type React from "react"
import { useState } from "react"
import type { posts, comments } from "@/types/forums/types"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, MessageCircle, Share2, Clock, Send } from "lucide-react"
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

  const handleVote = (type: "up" | "down") => {
    if (voted === type) {
      setVoted(null)
      type === "up" ? setUpvotes((prev) => prev - 1) : setDownvotes((prev) => prev - 1)
    } else {
      if (voted) {
        type === "up"
          ? (setDownvotes((prev) => prev - 1), setUpvotes((prev) => prev + 1))
          : (setUpvotes((prev) => prev - 1), setDownvotes((prev) => prev + 1))
      } else {
        type === "up" ? setUpvotes((prev) => prev + 1) : setDownvotes((prev) => prev + 1)
      }
      setVoted(type)
    }
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const isGif = (src: string) => src?.endsWith(".gif")

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-lg border border-accent/20 bg-card/80 backdrop-blur-sm"
      >
        {/* User Info */}
        <div className="flex items-center justify-between border-b border-border/30 p-4">
          <Link href={`/forums/@${post.user.usertag}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/50 bg-muted/20">
              <Image
                src={post.user.avatar || "/placeholder.svg?height=40&width=40"}
                alt={`${post.user.name}'s Avatar`}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
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
            <div className="relative mb-6 overflow-hidden rounded-md">
              <Image
                src={post.image || "/placeholder.svg"}
                alt="Post content"
                className="w-full object-cover"
                width={800}
                height={600}
                unoptimized={isGif(post.image)}
              />
            </div>
          )}

          {post.plugins?.map((item, idx) => {
            if (item.type === "tenor") {
              return (
                <div key={`tenor-${idx}`} className="relative mb-6 overflow-hidden rounded-md">
                  <Image
                    src={(item.href as string) || "/placeholder.svg"}
                    alt="GIF"
                    className="w-full"
                    width={600}
                    height={400}
                    unoptimized
                  />
                </div>
              )
            }

            if (item.type === "url" && item.jsonData) {
              return (
                <div key={`url-${idx}`} className="mb-6 overflow-hidden rounded-md border border-border/30 bg-muted/10">
                  <div className="flex items-center justify-between border-b border-border/20 p-3">
                    <div className="flex items-center gap-2">
                      {item.jsonData.favicon && (
                        <Image
                          src={item.jsonData.favicon || "/placeholder.svg"}
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
                      <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  </div>

                  <div className="p-3">
                    <h3 className="mb-1 text-sm font-medium text-foreground">{item.jsonData.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.jsonData.description}</p>
                  </div>

                  {item.jsonData.image && (
                    <div className="relative h-60 w-full overflow-hidden">
                      <Image
                        src={item.jsonData.image || "/placeholder.svg"}
                        alt={item.jsonData.title || "Link preview"}
                        className="h-full w-full object-cover"
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
        <div className="flex items-center justify-between border-t border-border/30 px-4 py-3">
          <div className="flex items-center gap-6">
            {/* Upvote */}
            <button
              onClick={() => handleVote("up")}
              className={`group flex items-center gap-2 transition-all ${
                voted === "up" ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <ArrowUp
                className={`h-5 w-5 transition-transform ${voted === "up" ? "scale-110" : "group-hover:scale-110"}`}
              />
              <span className="text-sm font-medium">{upvotes}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote("down")}
              className={`group flex items-center gap-2 transition-all ${
                voted === "down" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <ArrowDown
                className={`h-5 w-5 transition-transform ${voted === "down" ? "scale-110" : "group-hover:scale-110"}`}
              />
              <span className="text-sm font-medium">{downvotes}</span>
            </button>
          </div>

          {/* Share */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="group flex items-center gap-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Share2 className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Comments ({comments.length})</h2>

        {/* Comment Form */}
        <form className="mb-6">
          <div className="flex gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border/50 bg-muted/20">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Your Avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {comments.length > 0 ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {comments.map((comment) => (
              <motion.div
                key={comment.commentid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border/20 bg-card/50 p-4"
              >
                <div className="flex gap-3">
                  <Link href={`/forums/@${comment.user.usertag}`}>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border/50 bg-muted/20">
                      <Image
                        src={comment.user.avatar || "/placeholder.svg?height=32&width=32"}
                        alt={`${comment.user.name}'s Avatar`}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/forums/@${comment.user.usertag}`} className="font-medium hover:underline">
                        {comment.user.name || comment.user.usertag}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {comment.user.name && `@${comment.user.usertag}`}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{comment.caption}</p>
                    {comment.image && (
                      <div className="mt-2 overflow-hidden rounded-md">
                        <Image
                          src={comment.image || "/placeholder.svg"}
                          alt="Comment image"
                          width={300}
                          height={200}
                          className="max-h-60 w-auto object-contain"
                          unoptimized={isGif(comment.image)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-muted/20 p-3">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No comments yet</h3>
            <p className="text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostDetail
