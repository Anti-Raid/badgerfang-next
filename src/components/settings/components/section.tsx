"use client"

import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Plus } from "lucide-react"

interface SectionProps {
  title: string
  description: string
  icon: React.ReactNode
  children?: React.ReactNode
  defaultOpen?: boolean
}

export const Section: React.FC<SectionProps> = ({ title, description, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          {React.cloneElement(icon as React.ReactElement, {
            className: "w-5 h-5 text-primary",
          })}
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="bg-card rounded-xl border border-border hover:border-primary/20 transition-colors duration-300 overflow-hidden shadow-sm">
        <div
          className="p-4 flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-foreground font-medium">New {title}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="ml-auto"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-t border-border p-5 bg-card/50">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

