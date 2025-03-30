"use client";

import { Suspense } from 'react';
import Settings from '@/components/settings/layout';
import { useSearchParams } from 'next/navigation';

function GuildContent() {
  const searchParams = useSearchParams();
  const guildId = searchParams.get('id');

  if (!guildId) {
    return <div>Guild ID is missing.</div>;
  }

  return <Settings guildId={guildId as string} />;
}

export default function Guild() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <GuildContent />
      </Suspense>
    </div>
  );
}
