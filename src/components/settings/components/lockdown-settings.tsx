"use client"

import type React from "react"
import { useState } from "react"
import { Primary } from "../../ui/Buttons"
import { RadioOption, Toggle, InputField } from "./form-elements"
import { executeSettings } from "@/lib/api"

interface LockdownSettingsProps {
  guildId: string;
}

export const LockdownSettings: React.FC<LockdownSettingsProps> = ({ guildId }) => {
  const [radioOption, setRadioOption] = useState("addOther")
  const [requireCorrectLayout, setRequireCorrectLayout] = useState(true)
  const [memberRoles, setMemberRoles] = useState([""])

  const handleAddRole = () => {
    setMemberRoles([...memberRoles, ""])
  }

  const handleRoleChange = (index: number, value: string) => {
    const updatedRoles = [...memberRoles]
    updatedRoles[index] = value
    setMemberRoles(updatedRoles)
  }

  const handleAddLockdownSettings = async () => {
    const payload = {
      operation: "Create",
      setting: "lockdown_guilds",
      fields: {
        require_correct_layout: requireCorrectLayout,
        member_roles: memberRoles.filter(role => role.trim() !== ""),
      },
    }

    try {
      const result = await executeSettings(guildId, payload)
      console.log("Lockdown settings added:", result)
    } catch (error) {
      console.error("Failed to add lockdown settings:", error)
    }
  }

  return (
    <>
      <div className="mb-4">
        <label className="block text-foreground mb-1">Member Roles</label>
        <div className="flex items-center mt-2">
          <RadioOption
            label="Add Other"
            name="memberRoles"
            checked={radioOption === "addOther"}
            onChange={() => setRadioOption("addOther")}
          />
          <RadioOption
            label="Add At Position"
            name="memberRoles"
            checked={radioOption === "addAtPosition"}
            onChange={() => setRadioOption("addAtPosition")}
          />
        </div>
      </div>

      {memberRoles.map((role, index) => (
        <InputField
          key={index}
          label={`Role ${index + 1}`}
          placeholder="Enter the role"
          value={role}
          onChange={(e) => handleRoleChange(index, e.target.value)}
        />
      ))}

      <Primary Title="Add Another Role" onClick={handleAddRole} />

      <Toggle
        label="Require Correct Layout"
        description="Whether or not a lockdown can proceed even without correct critical role permissions. May lead to partial lockdowns if disabled"
        checked={requireCorrectLayout}
        onChange={() => setRequireCorrectLayout(!requireCorrectLayout)}
      />

      <Primary Title="Add Lockdown Settings" onClick={handleAddLockdownSettings} />
    </>
  )
}
