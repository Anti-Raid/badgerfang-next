"use client";

import Settings from '@/components/settings/layout';
import { useSearchParams } from 'next/navigation';

export default function Guild() {
  const searchParams = useSearchParams();
  const guildId = searchParams.get('id');

  if (!guildId) {
    return <div>Guild ID is missing.</div>;
  }

  return (
    <div className="min-h-screen">
      <Settings guildId={guildId} />
    </div>
  );
}
