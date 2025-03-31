"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { FiX } from "react-icons/fi"
import { ScriptIDE } from "@/components/ide/ide"
import { Primary } from "../../ui/Buttons"

interface ScriptModalProps {
  isOpen: boolean
  onClose: () => void
  content: Record<string, string>
  scriptName: string
  isEditMode?: boolean
  onContentChange?: (content: Record<string, string>) => void
  onSave?: () => void
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  content,
  scriptName,
  isEditMode = false,
  onContentChange,
  onSave,
}) => {
  const [localContent, setLocalContent] = useState<Record<string, string>>(content)

  // Update local content when the content prop changes
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  if (!isOpen) return null

  // Convert content object to files array for ScriptIDE
  const contentToFiles = (content: Record<string, string>) => {
    return Object.entries(content).map(([name, content]) => ({
      name,
      path: name,
      content,
      type: "file" as const,
    }))
  }

  const handleContentChange = (newContent: Record<string, string>) => {
    setLocalContent(newContent)
    if (onContentChange) {
      onContentChange(newContent)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      onClose();
    }
  };
  

  const modalTitle = isEditMode
    ? scriptName === "New Script"
      ? "Add Script Content"
      : `Edit Script: ${scriptName}`
    : `View Script: ${scriptName}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold">{modalTitle}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-auto p-4">
          <ScriptIDE
            files={contentToFiles(localContent)}
            isContentEditable={isEditMode}
            onContentChange={handleContentChange}
            height="500px"
            width="290%"
          />
        </div>
        {isEditMode && (
          <div className="p-4 border-t border-border flex justify-end">
            <Primary Title="Save Changes" onClick={handleSave} />
          </div>
        )}
      </div>
    </div>
  )
}

