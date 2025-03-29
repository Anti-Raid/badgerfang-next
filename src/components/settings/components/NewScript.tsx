"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Primary } from "../../ui/Buttons";
import { InputField, RadioOption, Toggle } from "./form-elements";
import { ScriptIDE } from "@/components/ide/ide";
import { executeSettings, getBotState } from "@/lib/api";
import { FaTrash } from "react-icons/fa";
import { ScriptModal } from "./ScriptModal";

interface Script {
  id: string;
  name: string;
  language: string;
  content: string;
  paused: boolean;
  error_channel: string;
  allowed_caps: string[];
  events: string[];
}

interface ScriptsProps {
  guildId: string;
}

export const Scripts: React.FC<ScriptsProps> = ({ guildId }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [newScript, setNewScript] = useState<Script>({
    id: "",
    name: "",
    language: "luau",
    content: "",
    paused: false,
    error_channel: "",
    allowed_caps: [],
    events: [],
  });
  const [showScriptForm, setShowScriptForm] = useState(false);
  const [eventsOptions, setEventsOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      const payload = {
        operation: "View",
        setting: "scripts",
        fields: {},
      };
  
      try {
        const result = await executeSettings(guildId, payload);
        const scriptsData = result.fields.map((script: any, index: number) => ({
          id: index.toString(),
          name: script.name,
          language: script.language,
          content: script.content,
          paused: script.paused,
          error_channel: script.error_channel,
          allowed_caps: script.allowed_caps,
          events: script.events,
        }));
        setScripts(scriptsData);
      } catch (error) {
        console.error("Failed to fetch scripts:", error);
      }
    };
  
    const fetchEvents = async () => {
      try {
        const result = await getBotState();
        const scriptShopSetting = result.settings.find(
          (setting: any) => setting.id === "script_shop"
        );
  
        if (scriptShopSetting) {
          const eventsColumn = scriptShopSetting.columns.find(
            (column: any) => column.id === "events"
          );
  
          if (eventsColumn && eventsColumn.column_type?.Array?.inner?.String?.allowed_values) {
            const eventsData = eventsColumn.column_type.Array.inner.String.allowed_values.map(
              (event: string) => ({
                value: event,
                label: event,
              })
            );
            setEventsOptions(eventsData);
          } else {
            console.error("Expected properties are undefined");
          }
          
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
  
    fetchScripts();
    fetchEvents();
  }, [guildId]);
  

  const handleAddScript = async () => {
    const payload = {
      operation: "Create",
      setting: "scripts",
      fields: {
        name: newScript.name,
        language: newScript.language,
        content: newScript.content,
        paused: newScript.paused,
        error_channel: newScript.error_channel,
        allowed_caps: newScript.allowed_caps,
        events: newScript.events,
      },
    };

    try {
      const result = await executeSettings(guildId, payload);
      console.log("Script added:", result);
      setScripts([...scripts, { ...newScript, id: scripts.length.toString() }]);
      setNewScript({
        id: "",
        name: "",
        language: "luau",
        content: "",
        paused: false,
        error_channel: "",
        allowed_caps: [],
        events: [],
      });
      setShowScriptForm(false);
    } catch (error) {
      console.error("Failed to add script:", error);
    }
  };

  const handleDeleteScript = async (id: string) => {
    const payload = {
      operation: "Delete",
      setting: "scripts",
      fields: {
        guild_id: guildId,
      },
    };

    try {
      await executeSettings(guildId, payload);
      setScripts(scripts.filter((script) => script.id !== id));
    } catch (error) {
      console.error("Failed to delete script:", error);
    }
  };

  return (
    <>
      <Primary Title="Add Script" onClick={() => setShowScriptForm(!showScriptForm)} />

      {showScriptForm && (
        <div>
          <InputField
            label="Name"
            description="The name to give to the script"
            value={newScript.name}
            onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
          />

          <InputField
            label="Language"
            description="The language of the script"
            value={newScript.language}
            onChange={(e) => setNewScript({ ...newScript, language: e.target.value })}
          />

          <InputField
            label="Content"
            description="The content of the script"
            value={newScript.content}
            onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
          />

          <Toggle
            label="Paused"
            description="Whether the script is paused or not"
            checked={newScript.paused}
            onChange={() => setNewScript({ ...newScript, paused: !newScript.paused })}
          />

          <InputField
            label="Error Channel"
            description="The channel to report any errors to"
            value={newScript.error_channel}
            onChange={(e) => setNewScript({ ...newScript, error_channel: e.target.value })}
          />

          <InputField
            label="Events"
            description="The events that this script can be executed on."
            type="select"
            value={newScript.events.join(", ")}
            onChange={(e) => {
              const selectedEvents = e.target.value.split(", ");
              setNewScript({ ...newScript, events: selectedEvents });
            }}
            options={eventsOptions}
          />

          <Primary Title="Add Script" onClick={handleAddScript} />
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Existing Scripts</h3>
        {scripts.map((script) => (
          <div key={script.id} className="bg-background border border-primary border-opacity-20 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Name: {script.name}</p>
                <p className="text-muted-foreground">Language: {script.language}</p>
                <p className="text-muted-foreground">Paused: {script.paused ? "Yes" : "No"}</p>
                <p className="text-muted-foreground">Error Channel: {script.error_channel}</p>
                <p className="text-muted-foreground">Events: {script.events.join(", ")}</p>
              </div>
              <div className="flex space-x-2">
                <Primary Title="View Code" onClick={() => setSelectedScript(script)} />
                <Primary Title="Delete" onClick={() => handleDeleteScript(script.id)} icon={FaTrash} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedScript && (
        <ScriptModal
          isOpen={!!selectedScript}
          onClose={() => setSelectedScript(null)}
          scriptContent={selectedScript.content}
          scriptName={selectedScript.name}
        />
      )}
    </>
  );
};
