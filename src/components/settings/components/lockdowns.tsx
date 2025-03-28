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
  const [type, setType] = useState("")
  const [reason, setReason] = useState("")
  const [lockdowns, setLockdowns] = useState<Lockdown[]>([])

  useEffect(() => {
    const fetchLockdowns = async () => {
      const payload = {
        operation: "View",
        setting: "lockdowns",
        fields: {},
      }

      try {
        const result = await executeSettings(guildId, payload)
        const lockdownsData = result.fields.map((lockdown: any, index: number) => ({
          id: index.toString(), // Use index as a temporary ID
          type: lockdown.type,
          reason: lockdown.reason,
          created_at: lockdown.created_at,
        }))
        setLockdowns(lockdownsData)
      } catch (error) {
        console.error("Failed to fetch lockdowns:", error)
      }
    }

    fetchLockdowns()
  }, [guildId])

  const handleAddLockdown = async () => {
    const payload = {
      operation: "Create",
      setting: "lockdowns",
      fields: {
        type: type,
        reason: reason,
      },
    }

    try {
      const result = await executeSettings(guildId, payload)
      console.log("Lockdown added:", result)
      // Optionally, update the lockdowns list
    } catch (error) {
      console.error("Failed to add lockdown:", error)
    }
  }

  const handleDeleteLockdown = async (id: string) => {
    const payload = {
      operation: "Delete",
      setting: "lockdowns",
      fields: {
        guild_id: guildId,
      },
    }

    try {
      await executeSettings(guildId, payload)
      setLockdowns(lockdowns.filter(lockdown => lockdown.id !== id))
    } catch (error) {
      console.error("Failed to delete lockdown:", error)
    }
  }

  const lockdownTypes = [
    { value: "qsl", label: "QSL" },
    { value: "tsl", label: "TSL" },
    { value: "scl", label: "SCL" },
  ]

  return (
    <>
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

      <Primary Title="Add Lockdown" onClick={handleAddLockdown} />

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Existing Lockdowns</h3>
        {lockdowns.map((lockdown) => (
          <div key={lockdown.id} className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Type: {lockdown.type}</p>
                <p className="text-muted-foreground">Reason: {lockdown.reason}</p>
                <p className="text-muted-foreground">Created At: {new Date(lockdown.created_at).toLocaleString()}</p>
              </div>
              <Primary Title="Delete" onClick={() => handleDeleteLockdown(lockdown.id)} icon={FaTrash} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
