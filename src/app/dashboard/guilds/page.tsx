'use client';

import { Suspense } from 'react';
import Settings from '@/components/settings/layout';
import { useSearchParams } from 'next/navigation';

export default function Guild() {
  const searchParams = useSearchParams();
  const guildId = searchParams.get('id');

  if (!guildId) {
    return <div>Guild ID is missing.</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <Settings guildId={guildId} />
      </div>
    </Suspense>
  );
}
