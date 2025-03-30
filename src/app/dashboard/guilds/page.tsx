"use client";

import { Suspense, useEffect, useState } from "react";
import Settings from "@/components/settings/layout";
import { useSearchParams } from "next/navigation";

function GuildContent() {
  const searchParams = useSearchParams();
  const guildId = searchParams.get("id");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) {
      setError("Guild ID is missing.");
      setLoading(false);
      return;
    }

    const fetchGuildData = async () => {
      try {
        const res = await fetch(
          `https://splashtail-staging.antiraid.xyz/users/@me/guilds/${guildId}`
        );
        const data = await res.json();

        if (res.status === 403 && data.message) {
          setError(data.message);
        } else if (!res.ok) {
          setError("Failed to load guild data.");
        }

        setLoading(false);
      } catch {
        setError("An unexpected error occurred.");
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [guildId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">Loading guild data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="max-w-md">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-gray-500 mt-2">
            If you believe this is an error, please contact a server administrator.
          </p>
        </div>
      </div>
    );
  }

  return <Settings guildId={guildId} />;
}

export default function Guild() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-lg font-semibold">Loading...</div>}>
        <GuildContent />
      </Suspense>
    </div>
  );
}
