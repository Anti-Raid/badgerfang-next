"use client"

import type React from "react"
import { useState } from "react"
import { Primary } from "../../ui/Buttons"
import { InputField } from "./form-elements"
import { executeSettings } from "@/lib/api"

interface LockdownProps {
  guildId: string;
}

export const Lockdowns: React.FC<LockdownProps> = ({ guildId }) => {
  const [type, setType] = useState("")
  const [reason, setReason] = useState("")

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
    } catch (error) {
      console.error("Failed to add lockdown:", error)
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
    </>
  )
}
