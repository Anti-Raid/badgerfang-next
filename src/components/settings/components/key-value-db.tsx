"use client"

import type React from "react"
import { useState } from "react"
import { Primary } from "../../ui/Buttons"
import { InputField } from "./form-elements"
import { executeSettings } from "@/lib/api"

interface KeyValueDBProps {
  guildId: string;
}

export const KeyValueDB: React.FC<KeyValueDBProps> = ({ guildId }) => {
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")

  const handleAddKeyValue = async () => {
    const payload = {
      operation: "Create",
      setting: "script_kv",
      fields: {
        key: key,
        value: value,
      },
    }

    try {
      const result = await executeSettings(guildId, payload)
      console.log("Key-value added:", result)
    } catch (error) {
      console.error("Failed to add key-value:", error)
    }
  }

  return (
    <>
      <InputField
        label="Key"
        description="Key"
        placeholder="Enter the key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />

      <InputField
        label="Value"
        description="The value of the record"
        placeholder="Enter the value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Primary Title="Add Scripts (key-value db)" onClick={handleAddKeyValue} />
    </>
  )
}