"use client"

import type React from "react"
import { Primary } from "../../ui/Buttons"

export const Scripts: React.FC = () => {
  return <Primary Title="Add Script" onClick={() => console.log("Add Script")} />
}

