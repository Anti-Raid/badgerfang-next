"use client"

import { Shield, User, Code, Database, FileCode, Lock, Bell } from "lucide-react"
import { Section } from "./components/section"
import { RoleManager } from "./components/role-manager"
import { ServerMembers } from "./components/server-members"
import { Scripts } from "./components/NewScript"
import { KeyValueDB } from "./components/key-value-db"
import { PublishedScripts } from "./components/published-scripts"
import { LockdownSettings } from "./components/lockdown-settings"
import { Lockdowns } from "./components/lockdowns"
import { useEffect, useState } from "react"
import { getUserGuildBaseInfo, executeSettings } from "@/lib/api"
import { motion } from "framer-motion"

/**
 * Renders the settings dashboard for a guild.
 *
 * This component retrieves and displays the guild's base information using the provided guild ID.
 * While data is being fetched, a loading indicator is shown. If an error occurs, an error message with a retry option is displayed.
 * Once loaded, the dashboard presents a sticky header with the guild's icon and name, a theme selector, and sections for managing
 * server roles, members, scripts, key-value data, published scripts, and lockdown settings.
 *
 * @param guildId - Unique identifier for the guild.
 * @returns A JSX element representing the settings dashboard.
 */
export default function Settings({ guildId }: { guildId: string }) {
  const [guildData, setGuildData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTheme, setActiveTheme] = useState<string>("dark")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserGuildBaseInfo(guildId)
        setGuildData(data)
      } catch (error) {
        if (isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || "Failed to fetch guild data. Please try again later."
          setError(errorMessage)
        } else {
          setError("An unexpected error occurred. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guildId])

  /**
   * Determines whether the provided error object is likely an Axios error.
   *
   * This type guard checks if the error is non-null and contains a response property,
   * which is characteristic of errors produced by Axios HTTP requests.
   *
   * @param error - The error object to evaluate.
   * @returns True if the error object has a response property; otherwise, false.
   */
  function isAxiosError(error: any): error is { response?: { data?: { message?: string } } } {
    return error && error.response
  }

  const handleExecuteSettings = async (operation: string, setting: string, fields: any) => {
    try {
      const payload = { operation, setting, fields }
      const result = await executeSettings(guildId, payload)
    } catch (error) {
      console.error("Failed to execute settings:", error)
    }
  }

  const changeTheme = (theme: string) => {
    document.documentElement.className = theme
    setActiveTheme(theme)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading guild data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-6 rounded-xl border border-destructive max-w-md w-full">
          <div className="text-destructive mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Error</h3>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {guildData.icon ? (
              <img
                src={guildData.icon || "/placeholder.svg"}
                alt={guildData.name}
                className="w-10 h-10 rounded-full border-2 border-primary/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {guildData.name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-bold">{guildData.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-extra bg-clip-text text-transparent">
            Welcome to your Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Control all aspects of AntiRaid and its operation on your server
          </p>

          <div className="mt-6 p-5 bg-accent rounded-xl border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-extra/5 opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Pro Tip
              </h3>
              <p className="text-foreground">
                Want something beyond the core commands? Check out{" "}
                <span className="text-primary font-semibold">Templating</span>, the official way to extend AntiRaid to
                meet your needs!
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          <Section
            title="Server Roles"
            description="Configure server roles permissions on AntiRaid"
            icon={<Shield />}
            defaultOpen={true}
          >
            <RoleManager guildId={guildId} />
          </Section>

          <Section title="Server Members" description="Manage server members and their permissions" icon={<User />}>
            <ServerMembers guildId={guildId} />
          </Section>

          <Section title="Scripts" description="Configure your servers' custom scripts and automations" icon={<Code />}>
            <Scripts guildId={guildId} />
          </Section>

          <Section
            title="Key-Value Database"
            description="Key-value database available to scripts on this server"
            icon={<Database />}
          >
            <KeyValueDB guildId={guildId} />
          </Section>

          <Section
            title="Published Scripts"
            description="Publish new scripts to the shop that can be used by any other server"
            icon={<FileCode />}
          >
            <PublishedScripts />
          </Section>

          <Section
            title="Lockdown Settings"
            description="Setup standard lockdown settings for a server"
            icon={<Lock />}
          >
            <LockdownSettings guildId={guildId} />
          </Section>

          <Section title="Lockdowns" description="Manage active and scheduled lockdowns" icon={<Lock />}>
            <Lockdowns guildId={guildId} />
          </Section>
        </div>
      </div>
    </div>
  )
}

