'use client';

import  Dashboard  from "@/components/dashboard/session"
export const runtime = 'edge';

export default function Settings() {
  return (
    <div className="min-h-screen">

      <Dashboard />
    </div>
  );
}
