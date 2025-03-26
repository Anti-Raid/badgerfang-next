"use client"

import type React from "react"
import { useState } from "react"
import { Primary } from "../../ui/Buttons"
import { InputField, RadioOption, Toggle } from "./form-elements"
import { executeSettings } from "@/lib/api"

interface ServerMembersProps {
  guildId: string;
}

export const ServerMembers: React.FC<ServerMembersProps> = ({ guildId }) => {
  const [userId, setUserId] = useState("")
  const [radioOption, setRadioOption] = useState("addOther")
  const [isPublic, setIsPublic] = useState(true)

  const handleAddServerMember = async () => {
    const permOverrides = radioOption === "addOther" ? ["addOther"] : ["addAtPosition"]
    const payload = {
      operation: "Create",
      setting: "guild_members",
      fields: {
        user_id: userId,
        public: isPublic,
        perm_overrides: permOverrides,
      },
    }

    try {
      const result = await executeSettings(guildId, payload)
      console.log("Server member added:", result)
    } catch (error) {
      console.error("Failed to add server member:", error)
    }
  }

  return (
    <>
      <InputField
        label="User ID"
        description="The user ID. Cannot be updated once set"
        placeholder="Enter the user ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <div className="mb-4">
        <label className="block text-foreground mb-1">Permission Overrides</label>
        <div className="flex items-center mt-2">
          <RadioOption
            label="Add Other"
            name="permissionOverrides"
            checked={radioOption === "addOther"}
            onChange={() => setRadioOption("addOther")}
          />
          <RadioOption
            label="Add At Position"
            name="permissionOverrides"
            checked={radioOption === "addAtPosition"}
            onChange={() => setRadioOption("addAtPosition")}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">No values added</p>
      </div>

      <Toggle
        label="Public"
        description="Whether the member is public or not"
        checked={isPublic}
        onChange={() => setIsPublic(!isPublic)}
      />

      <Primary Title="Add Server Members" onClick={handleAddServerMember} />
    </>
  )
}
