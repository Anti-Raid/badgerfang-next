'use client';

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SocialMediaMetadata {
	// Facebook Open Graph
	og?: {
		type?: 'website' | 'article' | 'profile' | 'book' | 'music' | 'video';
		site_name?: string;
		locale?: string;
	};

	// Twitter Card specifics
	twitter?: {
		card?: 'summary' | 'summary_large_image' | 'app' | 'player';
		site?: string;
	};
}

interface SEOStructuredData {
	'@context'?: string;
	'@type'?: string;
	name?: string;
	description?: string;
	image?: string | string[];
	url?: string;
	[key: string]: any;
}

interface AdvancedSEOProps {
	// Core SEO metadata
	title: string;
	description: string;

	// Optional SEO configurations
	canonical?: string;
	keywords?: string[];

	// Image configurations
	image?: {
		url: string;
		width?: number;
		height?: number;
		alt?: string;
	};

	// Robots meta tag configuration
	robotsConfig?: {
		index?: boolean;
		follow?: boolean;
		additional?: string[];
	};

	// Social media and structured data
	social?: SocialMediaMetadata;
	structuredData?: SEOStructuredData | SEOStructuredData[];

	// Additional metadata
	additionalMetaTags?: React.DetailedHTMLProps<
		React.MetaHTMLAttributes<HTMLMetaElement>,
		HTMLMetaElement
	>[];
}

const SEO: React.FC<AdvancedSEOProps> = ({
	title,
	description,
	canonical,
	keywords = [],
	image = {
		url: '/og_image.png',
		width: 1200,
		height: 630,
		alt: 'Default website image'
	},
	robotsConfig = { index: true, follow: true },
	social = {},
	structuredData,
	additionalMetaTags = []
}) => {
	// Generate robots meta content
	const robotsContent = [
		robotsConfig.index ? 'index' : 'noindex',
		robotsConfig.follow ? 'follow' : 'nofollow',
		...(robotsConfig.additional || [])
	].join(', ');

	return (
		<Helmet>
			{/* Basic HTML Meta Tags */}
			<title>{title}</title>
			<meta name="description" content={description} />

			{/* Keywords */}
			<meta
				name="keywords"
				content="Discord bot, AntiRaid, server protection, automated security, server moderation, spam defense, bot management, server backups, customizable features, Luau scripting, Lua customization, raid lockdown, harmful bot detection, server safety tools, Discord automation, real-time security, community management, data control, backup solutions, advanced moderation tools, scripting flexibility, developer tools, vendor lock-free bot, API access, customizable data exports, spam prevention, disruptive behavior control, instant alerts, server lockdown automation, backup and restore, local backup storage, channel moderation, anti-spam systems, Discord safety solutions, automated threat defense, powerful bot features, user-friendly tools, developer customization, scripting support, community security, Discord community tools, server admin features, anti-raid automation, smart moderation, dynamic bot customization, customizable API integration, channel access tools, server engagement tools, server moderation automation, server raid alerts, flexible bot scripting, bot-powered defense, seamless server safety, Discord threat protection, raid disruption management, community-focused moderation, advanced security, Luau-based bot, Roblox scripting, bot configuration, automated server lockdown, spam bot blocker, malicious behavior prevention, discord community management, real-time threat alerts, anti-raid functionality, user-friendly UI, Discord bot management, advanced bot scripting, customizable raid protection, server bot tools, data export support, flexible backup options, server threat defense, bot moderation solutions, developer-accessible tools, seamless integration, automated threat detection, Discord backup options, raid disruption tools, smart bot customization, effortless server management, user-focused security, flexible server controls, real-time defense alerts, automated moderation tools, Discord server safety, dynamic raid prevention, channel lockdown features, backup data control, anti-spam bot features, discord raid defense, channel access restrictions, server security features, seamless API tools, discord moderation bot, advanced discord automation, customizable bot tools, server raid blocker, instant bot alerts, discord bot API, security and moderation, server safety automation, customizable moderation bot, smart server defense, community safety tools, automated defense bot, advanced Lua scripting, Luau scripting bot, server control tools, discord spam blocker, server data tools, bot-powered server safety, anti-spam automation, customizable security settings, real-time server defense, discord threat tools, spam and raid prevention, server engagement solutions, bot scripting flexibility, automated server management, data-driven moderation tools, server-level safety, anti-disruption bot, discord bot safety, automated server control, smart discord tools, discord security tools, advanced community safety, bot-level protection, seamless discord automation, smart raid tools, community-focused discord bot, Luau scripting features, dynamic server tools, developer-focused bot, discord data exports, server safety alerts, automated backup options, discord-friendly tools, spam and raid alerts, channel-specific lockdowns, server threat detection, advanced discord scripting, anti-spam alerts, real-time moderation bot, discord admin tools, customizable discord API, bot features for server safety, data retention options, discord bot integration, instant server lockdown, bot scripting tools, security-focused discord bot, raid disruption alerts, Luau-based customization, discord bot-level management, spam and raid tools, server-level customization, real-time bot solutions, discord moderation automation, flexible moderation tools, anti-spam and raid blocker, automated community safety, discord bot-level scripting, server bot features, seamless bot-level tools, smart discord protection, dynamic security bot, real-time raid alerts, scripting-based bot tools, discord server solutions, anti-spam customization, server backup solutions, discord scripting flexibility, developer-friendly security tools, spam prevention systems, automated discord safety, server-level protection, discord bot innovation, community management automation, customizable defense systems, server bot management, server bot tools, advanced raid defense, channel-specific tools, discord server defense, anti-raid solutions, bot customization for discord, discord automation systems, smart bot features, Luau-powered tools, server data management, discord community automation, automated spam and raid tools, server safety innovation, bot-powered server solutions, dynamic discord tools, security-focused tools, automated scripting features, advanced discord protection, flexible server tools, spam and disruption management, discord moderation features, dynamic raid defense, server protection systems, anti-spam discord tools, server lockdown automation, bot-driven server tools, raid alert systems, server safety measures, automated bot-level defense, discord innovation tools, discord customization options, advanced bot-level security, server scripting tools, real-time discord protection, automated community tools, server moderation features, discord threat alerts, automated bot-level safety, flexible backup options, discord bot-level customization, server bot solutions, seamless discord integration, server control automation, advanced community protection, anti-raid automation tools, discord scripting solutions, flexible discord moderation, smart raid prevention, server-level scripting tools, dynamic backup features, anti-spam defense systems, real-time discord defense, channel-specific server tools, discord spam prevention tools, advanced server management, customizable discord safety, raid protection automation, bot-powered server management, dynamic raid tools, automated server tools, discord safety integration, anti-spam bot innovation, discord backup management, server-level bot solutions, seamless anti-raid features, discord customization tools, real-time server alerts, bot-powered raid prevention, dynamic security tools, discord admin automation, automated security features, customizable bot"
			/>

			{/* Robots Configuration */}
			<meta name="robots" content={robotsContent} />

			{/* Canonical URL */}
			{canonical && <link rel="canonical" href={canonical} />}

			{/* Open Graph / Facebook */}
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image.url} />
			{image.width && <meta property="og:image:width" content={image.width.toString()} />}
			{image.height && <meta property="og:image:height" content={image.height.toString()} />}
			{image.alt && <meta property="og:image:alt" content={image.alt} />}

			{/* Additional Open Graph configurations */}
			{social.og?.type && <meta property="og:type" content={social.og.type} />}
			{social.og?.site_name && <meta property="og:site_name" content={social.og.site_name} />}
			{social.og?.locale && <meta property="og:locale" content={social.og.locale} />}

			{/* Twitter Card */}
			<meta name="twitter:card" content={social.twitter?.card || 'summary_large_image'} />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image.url} />
			{social.twitter?.site && <meta name="twitter:site" content={social.twitter.site} />}

			{/* Additional meta tags */}
			{additionalMetaTags.map((tag, index) => (
				<meta key={`additional-meta-${index}`} {...tag} />
			))}

			{/* Structured Data (JSON-LD) */}
			{structuredData && (
				<script type="application/ld+json">{JSON.stringify(structuredData)}</script>
			)}
		</Helmet>
	);
};

export { SEO };
