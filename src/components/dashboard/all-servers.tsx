"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, RefreshCw, Search, Server, Shield } from "lucide-react"
import { toast } from "react-toastify"
import { FaDiscord } from "react-icons/fa"
import { getUserServers } from "@/lib/api"
import { supportConfig } from "@/lib/data/support"
import type { Server as ServerType, ApiResponse } from "@/types/dashboard/servers"
import type { AuthUser } from "@/types/user"

// Discord permission flags
const DISCORD_PERMISSIONS = {
  ADMINISTRATOR: 0x8,
  MANAGE_GUILD: 0x20,
  MANAGE_CHANNELS: 0x10,
  MANAGE_ROLES: 0x10000000,
  MANAGE_MESSAGES: 0x2000,
  MANAGE_WEBHOOKS: 0x80000000,
}

// Function to check if user has sufficient permissions to manage bot
const canManageBot = (permissions: number): boolean => {
  return !!(permissions & DISCORD_PERMISSIONS.ADMINISTRATOR || permissions & DISCORD_PERMISSIONS.MANAGE_GUILD)
}

// Function to get readable permission names
const getPermissionNames = (permissions: number): string[] => {
  const permNames: string[] = []

  if (permissions & DISCORD_PERMISSIONS.ADMINISTRATOR) {
    return ["Administrator"] // Admin has all permissions
  }

  if (permissions & DISCORD_PERMISSIONS.MANAGE_GUILD) permNames.push("Manage Server")
  if (permissions & DISCORD_PERMISSIONS.MANAGE_CHANNELS) permNames.push("Manage Channels")
  if (permissions & DISCORD_PERMISSIONS.MANAGE_ROLES) permNames.push("Manage Roles")
  if (permissions & DISCORD_PERMISSIONS.MANAGE_MESSAGES) permNames.push("Manage Messages")
  if (permissions & DISCORD_PERMISSIONS.MANAGE_WEBHOOKS) permNames.push("Manage Webhooks")

  return permNames.length ? permNames : ["Limited Access"]
}

const AllServers: React.FC = () => {
  const [userData, setUserData] = useState<AuthUser | null>(null)
  const [servers, setServers] = useState<ServerType[]>([])
  const [managedServers, setManagedServers] = useState<ServerType[]>([])
  const [yourServers, setYourServers] = useState<ServerType[]>([])
  const [managedSearchTerm, setManagedSearchTerm] = useState("")
  const [yourSearchTerm, setYourSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("managed")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const authUser = localStorage.getItem("authUser")
    if (authUser) {
      setUserData(JSON.parse(authUser))
    }
  }, [])

  const fetchServers = async (refetch = false) => {
    setIsLoading(true)
    if (refetch) setRefreshing(true)

    try {
      const response: ApiResponse = await getUserServers(refetch)
      const { guilds, has_bot } = response
      setServers(guilds)

      const managed = guilds.filter((server) => has_bot.includes(server.id))
      const yours = guilds.filter((server) => !has_bot.includes(server.id) && canManageBot(server.permissions))

      setManagedServers(managed)
      setYourServers(yours)

      if (refetch) {
        toast.success("Servers refreshed successfully")
      }
    } catch (error) {
      console.error("Failed to fetch servers:", error)
      toast.error("Failed to fetch servers")
    } finally {
      setIsLoading(false)
      if (refetch) {
        setTimeout(() => setRefreshing(false), 500)
      }
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  if (!userData && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      {/* User Profile Header */}
      <div className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-xl border border-border/50 transition-all duration-300 hover:shadow-primary/5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-extra rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            <img
              src={userData?.user.avatar || "/logo.webp"}
              alt="User Avatar"
              className="relative w-20 h-20 rounded-full border-2 border-primary object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-card z-10"></div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-foreground text-2xl font-bold">
              {userData?.user.display_name || userData?.user.username}
            </h2>
            <p className="text-muted-foreground">@{userData?.user.username}</p>
          </div>
          <button
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-accent-foreground px-5 py-2.5 rounded-lg transition-all duration-300 ml-auto transform hover:scale-105 hover:shadow-lg"
            onClick={() => fetchServers(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline font-medium">{refreshing ? "Refreshing..." : "Refresh Servers"}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-8 border-b border-border/50 relative">
        <button
          className={`px-6 py-3 font-medium text-lg transition-all duration-300 ${
            activeTab === "managed"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("managed")}
        >
          Managed Servers ({managedServers.length})
        </button>
        <button
          className={`px-6 py-3 font-medium text-lg transition-all duration-300 ${
            activeTab === "yours"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("yours")}
        >
          Your Servers ({yourServers.length})
        </button>
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10"></div>
      </div>

      {/* Active Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "managed" ? (
          <div className="animate-[theme-fade_0.3s_ease-in-out]">
            <ServerList
              servers={managedServers}
              searchTerm={managedSearchTerm}
              setSearchTerm={setManagedSearchTerm}
              showViewButton={true}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="animate-[theme-fade_0.3s_ease-in-out]">
            <ServerList
              servers={yourServers}
              searchTerm={yourSearchTerm}
              setSearchTerm={setYourSearchTerm}
              showViewButton={false}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </main>
  )
}

const ServerList: React.FC<{
  servers: ServerType[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  showViewButton: boolean
  isLoading: boolean
}> = ({ servers, searchTerm, setSearchTerm, showViewButton, isLoading }) => {
  const filteredServers = servers.filter((server) => server.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-extra/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        <div className="relative bg-accent/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border/30 shadow-lg transition-all duration-300 group-hover:shadow-primary/10">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search for a server"
            className="w-full bg-transparent text-foreground pl-12 pr-4 py-4 focus:outline-none placeholder-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card/80 rounded-xl p-6 border border-border/30 animate-pulse h-48 shadow-lg"
            ></div>
          ))}
        </div>
      ) : filteredServers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <ServerCard key={server.id} server={server} showViewButton={showViewButton} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-extra/20 rounded-full blur-lg"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <Server className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">No servers found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm
              ? "We couldn't find any servers matching your search"
              : showViewButton
                ? "You don't have any managed servers yet"
                : "You don't have any servers with sufficient permissions to add the bot"}
          </p>
          {!showViewButton && !searchTerm && servers.length === 0 && (
            <div className="mt-6 p-5 bg-accent/50 backdrop-blur-sm rounded-xl max-w-md text-sm border border-border/30 shadow-lg">
              <p className="text-muted-foreground mb-3">
                <strong>Note:</strong> You need <span className="text-primary font-medium">Manage Server</span> or{" "}
                <span className="text-primary font-medium">Administrator</span> permissions to add bots to a server.
              </p>
              <p className="text-muted-foreground">
                If you don't see your servers, make sure you're logged in with the correct Discord account.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ServerCard: React.FC<{ server: ServerType; showViewButton: boolean }> = ({ server, showViewButton }) => {
  const router = useRouter()
  const permissionValue = server.permissions
  const permissionNames = getPermissionNames(permissionValue)
  const isAdministrator = permissionNames.includes("Administrator")

  const handleViewClick = () => {
    router.push(`/dashboard/guilds/?id=${server.id}`)
  }

  const handleInviteClick = () => {
    const inviteUrl = supportConfig.invite.full.replace("{guild_id}", server.id)
    window.location.href = inviteUrl
  }

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-extra/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      <div className="relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border/30 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/20 group-hover:-translate-y-1">
        <div className="h-20 bg-gradient-to-r from-primary/80 via-primary/50 to-extra/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/5"></div>
        </div>
        <div className="p-6 pt-0 -mt-10">
          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-extra rounded-xl blur-sm opacity-70"></div>
              <img
                src={server.avatar || "/logo.webp"}
                alt={`${server.name} icon`}
                className="relative w-16 h-16 rounded-xl border-2 border-card bg-accent object-cover"
              />
            </div>
            <div className="mt-10">
              <h3 className="text-foreground font-bold text-lg truncate max-w-[180px]">{server.name}</h3>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1">
              {isAdministrator ? (
                <div className="bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-primary flex items-center gap-1 font-medium">
                  <FaDiscord className="h-3 w-3" />
                  <span>Administrator</span>
                </div>
              ) : (
                <div className="bg-accent/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>{permissionNames[0]}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">ID: {server.id.slice(0, 8)}...</div>
          </div>

          <button
            className={`flex items-center gap-2 px-4 py-3 rounded-lg w-full justify-center transition-all duration-300 ${
              showViewButton
                ? "bg-accent/80 backdrop-blur-sm text-foreground hover:bg-accent/60 hover:shadow-md"
                : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-primary/20 hover:shadow-md"
            }`}
            onClick={showViewButton ? handleViewClick : handleInviteClick}
          >
            {showViewButton ? (
              <>
                <Eye className="h-4 w-4" /> <span className="font-medium">Manage Server</span>
              </>
            ) : (
              <>
                <FaDiscord className="h-4 w-4" /> <span className="font-medium">Add Bot</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AllServers
