"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Primary } from "../../ui/Buttons"
import { InputField } from "./form-elements"
import { executeSettings } from "@/lib/api"
import { FaTrash } from "react-icons/fa"

interface LockdownProps {
  guildId: string;
}

interface Lockdown {
  id: string;
  type: string;
  reason: string;
  created_at: string;
}

export const Lockdowns: React.FC<LockdownProps> = ({ guildId }) => {
  const [type, setType] = useState("qsl") // Default to first option to avoid empty selection
  const [reason, setReason] = useState("")
  const [lockdowns, setLockdowns] = useState<Lockdown[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchLockdowns()
  }, [guildId])

  const fetchLockdowns = async () => {
    setIsLoading(true)
    const payload = {
      operation: "View",
      setting: "lockdowns",
      fields: {},
    }
    
    try {
      const result = await executeSettings(guildId, payload)
      const lockdownsData = result.fields.map((lockdown: any, index: number) => ({
        id: index.toString(),
        type: lockdown.type,
        reason: lockdown.reason,
        created_at: lockdown.created_at,
      }))
      setLockdowns(lockdownsData)
    } catch (error) {
      console.error("Failed to fetch lockdowns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLockdown = async () => {
    if (!type || !reason) {
      // Validate form inputs
      alert("Please select a type and provide a reason")
      return
    }

    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true)
    const payload = {
      operation: "Create",
      setting: "lockdowns",
      fields: {
        type: type,
        reason: reason,
      },
    }
    
    try {
      await executeSettings(guildId, payload)
      // Reset form fields
      setReason("")
      // Refresh the list
      await fetchLockdowns()
    } catch (error) {
      console.error("Failed to add lockdown:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLockdown = async (id: string) => {
    if (isLoading) return; // Prevent multiple deletions

    setIsLoading(true)
    const payload = {
      operation: "Delete",
      setting: "lockdowns",
      fields: {
        gid: id,
      },
    }
    
    try {
      await executeSettings(guildId, payload)
      // Update local state
      setLockdowns(lockdowns.filter(lockdown => lockdown.id !== id))
    } catch (error) {
      console.error("Failed to delete lockdown:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const lockdownTypes = [
    { value: "qsl", label: "QSL" },
    { value: "tsl", label: "TSL" },
    { value: "scl", label: "SCL" },
  ]

  return (
    <>
      <div className="space-y-4 mb-6">
        <InputField
          label="Type"
          description="The type of the lockdown."
          type="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={lockdownTypes}
        />
        <InputField
          label="Reason"
          description="The reason for starting the lockdown."
          placeholder="Enter the reason for the lockdown"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Primary 
          Title={isLoading ? "Adding..." : "Add Lockdown"} 
          onClick={handleAddLockdown} 
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Existing Lockdowns</h3>
        {isLoading ? (
          <div className="text-center py-4">Loading lockdowns...</div>
        ) : lockdowns.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No lockdowns found</div>
        ) : (
          lockdowns.map((lockdown) => (
            <div key={lockdown.id} className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">Type: {lockdown.type.toUpperCase()}</p>
                  <p className="text-muted-foreground">Reason: {lockdown.reason}</p>
                  <p className="text-sm text-muted-foreground">Created At: {new Date(lockdown.created_at).toLocaleString()}</p>
                </div>
                <Primary 
                  Title="Delete" 
                  onClick={() => handleDeleteLockdown(lockdown.id)} 
                  icon={FaTrash} 
                />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}