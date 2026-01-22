import { createFileRoute } from '@tanstack/react-router';
import { website_url, title, description, owner, twitter } from '@/components/common';

export const Route = createFileRoute('/llms.txt')({
	server: {
		handlers: {
			GET: async () => {
				const content = `# ${title}

> ${description}

## About
${title} is an advanced Discord bot protection and moderation platform designed to combat spam, harmful bots, and disruptive behavior. Built with TanStack Start, React, and TypeScript.

## Key Features
- Advanced anti-raid protection
- Automated moderation tools
- Real-time threat detection
- Luau scripting support for customization
- Server backup and restore
- Comprehensive API access
- Developer-friendly tools

## Documentation
- Homepage: ${website_url}
- Commands: ${website_url}/commands
- Developer Dashboard: ${website_url}/dashboard/developers
- Scripts Shop: ${website_url}/script/shop
- Status: ${website_url}/status
- Blog: ${website_url}/blogs

## API Endpoints
- Blog Posts (JSON-LD): ${website_url}/api/blogs
- Status: ${website_url}/api/get/status
- Sitemap: ${website_url}/api/sitemap/xml

## Key Facts
- Built with TanStack Start (React framework)
- Full TypeScript support
- Server-side rendering (SSR) enabled
- Structured data (JSON-LD) for LLM optimization
- Open Graph and Twitter Card support
- Real-time Discord bot integration

## Technology Stack
- Frontend: React 19, TanStack Router, TanStack Query
- Styling: Tailwind CSS
- Build: Vite
- Language: TypeScript
- Bot: Discord.js with Luau scripting support

## Contact & Social
- Website: ${website_url}
- Twitter: https://twitter.com/${twitter.replace('@', '')}
- GitHub: https://github.com/Anti-Raid
- Owner: ${owner}

## Content Types
- Blog posts with Article schema
- Documentation pages
- Command references
- Script templates
- Status updates

## Structured Data
All blog posts include Article schema (JSON-LD) with:
- Headline and description
- Author information
- Publication dates
- Tags and keywords
- Publisher information

## Best Practices
- Clear, factual content structure
- Hierarchical heading organization
- Authoritative attribution
- Machine-readable metadata
- SEO and LLMO optimized
`;

				return new Response(content, {
					headers: {
						'Content-Type': 'text/plain; charset=utf-8',
						'Cache-Control': 'public, max-age=3600, s-max-age=3600' // Cache for 1 hour
					}
				});
			}
		}
	}
});
