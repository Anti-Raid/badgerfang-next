"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Plus } from "lucide-react"
import { executeSettings } from "@/lib/api"

interface ShopItem {
  name: string
  version: string
  description: string
}

interface ShopExplorerProps {
  guildId: string;
}

export const ShopExplorer: React.FC<ShopExplorerProps> = ({ guildId }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [shopItems, setShopItems] = useState<ShopItem[]>([])

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const payload = { operation: "View", setting: "template_shop_public_list", fields: {} }
        const result = await executeSettings(guildId, payload)
        setShopItems(result.fields)
      } catch (error) {
        console.error("Failed to fetch shop items:", error)
      }
    }

    fetchShopItems()
  }, [guildId])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Explore the shop!</h2>
      <p className="text-muted-foreground mb-4">Explore other templates published by other servers</p>

      <div className="bg-accent rounded-lg border border-primary border-opacity-10 overflow-hidden mb-4">
        <div className="p-4 flex items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="mr-2">
            <ChevronDown className="w-5 h-5 text-foreground" />
          </motion.div>
          <Plus className="w-5 h-5 text-foreground" />
          <span className="ml-2 text-foreground font-medium">+ New Explore the shop!</span>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-t border-primary border-opacity-10 p-4">
                {/* Shop content would go here */}
                <p className="text-foreground">Shop content placeholder</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {shopItems.map((item, index) => (
        <div
          key={index}
          className="bg-accent rounded-lg border border-primary border-opacity-10 overflow-hidden mb-2 p-4"
        >
          <div className="flex items-center">
            <ChevronDown className="w-5 h-5 mr-2 text-foreground" />
            <span className="text-foreground font-medium">{item.name}</span>
            <span className="ml-2 text-muted-foreground">{item.version}</span>
          </div>
          <p className="text-muted-foreground mt-2">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
