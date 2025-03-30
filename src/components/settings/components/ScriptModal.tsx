"use client";
import React from "react";
import { ScriptIDE } from "@/components/ide/ide";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Record<string, string>;
  scriptName: string;
  isEditMode?: boolean;
  onContentChange?: (content: Record<string, string>) => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  content,
  scriptName,
  isEditMode = false,
  onContentChange,
}) => {
  const files: { name: string; path: string; content: string; type: "file" }[] =
  Object.entries(content).map(([filename, fileContent]) => ({
    name: filename,
    path: filename,
    content: fileContent,
    type: "file",
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="bg-background border border-primary border-opacity-20 h-[700px] w-full max-w-4xl rounded-xl shadow-2xl relative flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-all duration-200 p-2 rounded-full bg-gray-700/50 hover:bg-gray-700"
            >
              <FiX size={22} />
            </button>

            <h3 className="text-xl font-semibold p-4 text-gray-100">
              {scriptName}
            </h3>

            <div className="flex-1 overflow-hidden">
              <ScriptIDE
                files={files}
                isContentEditable={isEditMode}
                height="100%"
                width="100%"
                onContentChange={onContentChange}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};