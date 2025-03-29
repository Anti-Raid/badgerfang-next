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
  const [permissionValues, setPermissionValues] = useState<string[]>([])
  const [newPermissionValue, setNewPermissionValue] = useState("")
  const [positionValue, setPositionValue] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  
  const handleAddPermission = () => {
    if (newPermissionValue.trim()) {
      setPermissionValues([...permissionValues, newPermissionValue.trim()])
      setNewPermissionValue("")
    }
  }
  
  const handleRemovePermission = (index: number) => {
    const updatedPermissions = [...permissionValues]
    updatedPermissions.splice(index, 1)
    setPermissionValues(updatedPermissions)
  }
  
  const handleAddServerMember = async () => {
    // Use the appropriate permission values based on the selected option
    const permOverrides = radioOption === "addOther" 
      ? permissionValues 
      : [positionValue].filter(Boolean)
      
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
      // Reset form or show success message
    } catch (error) {
      console.error("Failed to add server member:", error)
      // Show error message
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
        
        <div className="mt-3">
          {radioOption === "addOther" ? (
            <div className="space-y-3">
              {/* Display existing permissions */}
              {permissionValues.length > 0 && (
                <div className="space-y-2">
                  {permissionValues.map((value, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="w-full bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(index)}
                        className="ml-2 p-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new permission field */}
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter permission value"
                  value={newPermissionValue}
                  onChange={(e) => setNewPermissionValue(e.target.value)}
                  className="w-full bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAddPermission}
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
              
              {permissionValues.length === 0 && !newPermissionValue && (
                <p className="text-sm text-muted-foreground mt-1">No values added</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Enter position value"
                value={positionValue}
                onChange={(e) => setPositionValue(e.target.value)}
                className="w-full bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              />
              {!positionValue && (
                <p className="text-sm text-muted-foreground mt-1">No position added</p>
              )}
            </div>
          )}
        </div>
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