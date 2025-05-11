"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { HiSparkles, HiTrendingUp, HiClock, HiFilter } from "react-icons/hi"
import { FaPlus } from "react-icons/fa"

interface FeedLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

const FeedLayout: React.FC<FeedLayoutProps> = ({
  children,
  title = "Forum Feed",
  description = "Check out the latest posts from the community",
}) => {
  const [activeFilter, setActiveFilter] = useState<"trending" | "new" | "top">("trending")

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-8">
        <motion.h1
          className="text-3xl font-bold flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
          <HiSparkles className="text-primary h-6 w-6" />
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {description}
        </motion.p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-1 bg-card/50 backdrop-blur-sm p-1 rounded-lg border border-border/30">
          <button
            onClick={() => setActiveFilter("trending")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeFilter === "trending"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-card/80 text-muted-foreground"
            }`}
          >
            <HiTrendingUp className="h-4 w-4" />
            Trending
          </button>
          <button
            onClick={() => setActiveFilter("new")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeFilter === "new" ? "bg-primary text-primary-foreground" : "hover:bg-card/80 text-muted-foreground"
            }`}
          >
            <HiClock className="h-4 w-4" />
            New
          </button>
          <button
            onClick={() => setActiveFilter("top")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeFilter === "top" ? "bg-primary text-primary-foreground" : "hover:bg-card/80 text-muted-foreground"
            }`}
          >
            <HiSparkles className="h-4 w-4" />
            Top
          </button>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-card/50 backdrop-blur-sm border border-border/30 text-muted-foreground hover:bg-card/80 transition-all">
            <HiFilter className="h-4 w-4" />
            Filter
          </button>
          <motion.button
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus className="h-3 w-3" />
            New Post
          </motion.button>
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  )
}

export default FeedLayout
