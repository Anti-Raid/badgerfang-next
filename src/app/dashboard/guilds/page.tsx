"use client";

import { SEO } from '@/components/SEO';
import { title, description, image, website_url } from '@/components/common';
import Settings from '@/components/settings/layout';
import { useSearchParams } from 'next/navigation';

export const runtime = 'edge';

export default function Guild() {
  const searchParams = useSearchParams();
  const guildId = searchParams.get('id');

  if (!guildId) {
    return <div>Guild ID is missing.</div>;
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`Settings | ${title}`}
        description={description}
        canonical={website_url}
        image={{
          url: `${image}`,
          width: 1920,
          height: 1080,
          alt: `${description}`
        }}
        robotsConfig={{
          index: true,
          follow: false,
          additional: ['noarchive']
        }}
        social={{
          og: {
            type: 'website',
            site_name: `Settings | AntiRaid`,
            locale: 'en_US'
          },
          twitter: {
            card: 'summary_large_image',
            site: `@Settings | AntiRaid`
          }
        }}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Commands | AntiRaid`,
          description: `${description}`
        }}
        additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
      />
      <Settings guildId={guildId} />
    </div>
  );
}
