"use client"

import { Shield, User, Code, Database, FileCode, Lock } from "lucide-react"
import { Section } from "./components/section"
import { RoleManager } from "./components/role-manager"
import { ServerMembers } from "./components/server-members"
import { Scripts } from "./components/NewScript"
import { KeyValueDB } from "./components/key-value-db"
import { PublishedScripts } from "./components/published-scripts"
import { LockdownSettings } from "./components/lockdown-settings"
import { Lockdowns } from "./components/lockdowns"
import { useEffect, useState } from "react";
import { getUserGuildBaseInfo, executeSettings } from "@/lib/api";

export default function Settings({ guildId }: { guildId: string }) {
  const [guildData, setGuildData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserGuildBaseInfo(guildId);
        setGuildData(data);
      } catch (error) {
        console.error("Failed to fetch guild data:", error);
      }
    };

    fetchData();
  }, [guildId]);

  const handleExecuteSettings = async (operation: string, setting: string, fields: any) => {
    try {
      const payload = { operation, setting, fields };
      const result = await executeSettings(guildId, payload);
    } catch (error) {
      console.error("Failed to execute settings:", error);
    }
  };

  if (!guildData) {
    return <div>Loading guild data...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <img src={guildData.icon} alt="Guild Icon" className="w-12 h-12 text-primary" />
        <h1 className="text-xl font-bold">{guildData.name}</h1>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
        <p className="text-muted-foreground">
          Using the dashboard, you can control almost all aspects of AntiRaid and its operation on your server!
        </p>
        <div className="mt-4 p-4 bg-accent rounded-lg border border-primary border-opacity-10">
          <p className="text-foreground">
            Want something beyond the core commands? Check out <span className="text-primary">Templating</span>, the
            official way to extend AntiRaid to meet your needs!
          </p>
        </div>
      </div>

      <Section
        title="Server Roles"
        description="Configure server roles permissions on AntiRaid"
        icon={<Shield className="w-5 h-5" />}
        defaultOpen={true}
      >
        <RoleManager guildId={guildId} />
      </Section>

      <Section title="Server Members" description="Manage server members" icon={<User className="w-5 h-5" />}>
        <ServerMembers guildId={guildId} />
      </Section>

      <Section title="Scripts" description="Configure your servers' custom scripts" icon={<Code className="w-5 h-5" />}>
        <Scripts guildId={guildId} />
      </Section>

      <Section
        title="Scripts (key-value db)"
        description="Key-value database available to scripts on this server"
        icon={<Database className="w-5 h-5" />}
      >
        <KeyValueDB guildId={guildId} />
      </Section>

      <Section
        title="Created/Published Scripts"
        description="Publish new scripts to the shop that can be used by any other server"
        icon={<FileCode className="w-5 h-5" />}
      >
        <PublishedScripts />
      </Section>

      <Section
        title="Lockdown Settings"
        description="Setup standard lockdown settings for a server"
        icon={<Lock className="w-5 h-5" />}
      >
        <LockdownSettings guildId={guildId} />
      </Section>

      <Section title="Lockdowns" description="Lockdowns" icon={<Lock className="w-5 h-5" />}>
        <Lockdowns guildId={guildId} />
      </Section>

    </div>
  );
}
