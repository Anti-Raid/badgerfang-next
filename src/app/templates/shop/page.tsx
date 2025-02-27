"use client";

import { SEO } from '@/components/SEO';
import { title, description, image, website_url } from '@/components/common';
//import { TemplateShop } from '@/components/templates/templateshop';
import type { TemplateShopProps } from '@/types/templates/template';

export default function TemplateShopPage() {
  const data: TemplateShopProps = {
    id: 1,
    name: "Sample Template",
    description: "This is a sample template for demonstration.",
    Owner: "Ran",
    OwnerAvatar: "https://cdn.discordapp.com/avatars/1234567890/abcdef1234567890abcdef1234567890.png",
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={`Settings | ${title}`}
        description={description}
        canonical={website_url}
        image={{
          url: image,
          width: 1920,
          height: 1080,
          alt: description,
        }}
        robotsConfig={{
          index: true,
          follow: false,
          additional: ['noarchive'],
        }}
        social={{
          og: {
            type: 'website',
            site_name: `Commands | AntiRaid`,
            locale: 'en_US',
          },
          twitter: {
            card: 'summary_large_image',
            site: `@Commands | AntiRaid`,
          },
        }}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Commands | AntiRaid`,
          description: description,
        }}
        additionalMetaTags={[{ name: 'copyright', content: '© 2024 Purrquinox' }]}
      />
      
      {/*<TemplateShop data={data} key={data.id} /> */}
    </div>
  );
}
