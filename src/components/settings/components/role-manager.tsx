"use client"

import type React from "react"
import { useState } from "react"
import { motion, Reorder } from "framer-motion"
import { GripVertical, Plus, Settings, Trash2 } from "lucide-react"
import { Primary } from "../../ui/Buttons"
import { InputField } from "./form-elements"

interface Role {
  id: string
  name: string
  color: string
  position: number
  premission: number
}

export const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { id: "1", name: "Admin", color: "#ff0000", position: 1, premission: 1 },
    { id: "2", name: "Moderator", color: "#00ff00", position: 2, premission: 2 },
    { id: "3", name: "Member", color: "#0000ff", position: 3, premission: 3 },
  ])

  const [newRole, setNewRole] = useState({
    name: "",
    color: "#7289da",
    premission: 0,
  })

  const [showNewRoleForm, setShowNewRoleForm] = useState(false)

  const handleAddRole = () => {
    if (newRole.name.trim()) {
      const newRoleObj: Role = {
        id: Date.now().toString(),
        name: newRole.name,
        color: newRole.color,
        position: roles.length + 1,
        premission: newRole.premission, // Ensure premission is included
      }

      setRoles([...roles, newRoleObj])
      setNewRole({ name: "", color: "#7289da", premission: 0 })
      setShowNewRoleForm(false)
    }
  }

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((role) => role.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Server Roles</h3>
        <button
          className="flex items-center gap-1 text-foreground bg-accent px-3 py-1.5 rounded-md hover:bg-accent/80 transition-colors"
          onClick={() => setShowNewRoleForm(!showNewRoleForm)}
        >
          <Plus className="w-4 h-4" />
          <span>New Role</span>
        </button>
      </div>

      {showNewRoleForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4"
        >
          <InputField
            label="Role Name"
            placeholder="Enter role name"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />

          <div className="mb-4">
            <label className="block text-foreground mb-1">Role Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newRole.color}
                onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-foreground">{newRole.color}</span>
            </div>
          </div>

          <InputField
            label="Premission"
            placeholder="What permissions does this role have?"
            value={newRole.premission.toString()}
            onChange={(e) => setNewRole({ ...newRole, premission: Number(e.target.value) })}
          />

          <div className="flex gap-2">
            <Primary Title="Add Role" onClick={handleAddRole} />
            <button
              className="px-4 py-2 border border-primary border-opacity-20 rounded-md text-foreground hover:bg-accent/50"
              onClick={() => setShowNewRoleForm(false)}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-background border border-primary border-opacity-20 rounded-md overflow-hidden">
        <Reorder.Group
          axis="y"
          values={roles}
          onReorder={setRoles}
          className="divide-y divide-primary divide-opacity-10"
        >
          {roles.map((role) => (
            <Reorder.Item key={role.id} value={role} className="p-3">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                <span className="font-medium text-foreground">{role.name}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button className="p-1 rounded-md hover:bg-accent/50">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-1 rounded-md hover:bg-accent/50" onClick={() => handleDeleteRole(role.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <p className="text-sm text-muted-foreground">Drag to reorder roles. Higher roles have more permissions.</p>
    </div>
  )
}
