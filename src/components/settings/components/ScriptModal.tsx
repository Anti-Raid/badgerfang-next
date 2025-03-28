"use client"

import React, { useState } from "react"
import { ScriptIDE } from "@/components/ide/ide"
import { motion, AnimatePresence } from "framer-motion"
import { FiX } from "react-icons/fi";

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptContent: string;
  scriptName: string;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ isOpen, onClose, scriptContent, scriptName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-background border border-primary border-opacity-20  p-6 rounded-lg shadow-lg relative w-full max-w-2xl">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <FiX />
            </button>
            <h3 className="text-lg font-medium mb-4">{scriptName}.luau</h3>
            <ScriptIDE
              files={[{ name: scriptName, path: scriptName, content: scriptContent, type: 'file' }]}
              isContentEditable={false}
              height="450px" 
              width="100%"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
