import type { ImageResponseOptions } from 'next/dist/compiled/@vercel/og/types';
import { ImageResponse } from 'next/og';
import type { ReactElement, ReactNode } from 'react';

const title = 'AntiRaid';

interface GenerateProps {
	title: ReactNode;
	tag: string;
	description?: ReactNode;
	primaryTextColor?: string;
	tags?: string[];
	showLogo?: boolean;
	showDomain?: boolean;
}

interface BlogGenerateProps {
	title: ReactNode;
	description?: ReactNode;
	tags?: string[];
	slug?: string;
	authorName?: string;
	authorAvatar?: string;
	primaryTextColor?: string;
	showLogo?: boolean;
	showAuthor?: boolean;
}

/**
 * Create an ImageResponse for a generic Open Graph image using the provided generation options.
 *
 * @param options - Content and rendering options for the Open Graph image (see GenerateProps) plus ImageResponseOptions
 * @returns An ImageResponse containing the generated Open Graph image sized 1200×630
 */
export function generateOGImage(options: GenerateProps & ImageResponseOptions): ImageResponse {
	const { title, tag, description, primaryTextColor, ...rest } = options;

	return new ImageResponse(
		generate({
			title,
			tag,
			description,
			primaryTextColor
		}),
		{
			width: 1200,
			height: 630,
			...rest
		}
	);
}

/**
 * Create an Open Graph image for a blog post.
 *
 * @param options - Configuration for the blog OG image (see `BlogGenerateProps`) and additional image response options; `showLogo` and `showAuthor` default to `true` when omitted.
 * @returns An ImageResponse representing a 1200×630 Open Graph image for the provided blog content
 */
export function generateBlogOGImage(
	options: BlogGenerateProps & ImageResponseOptions
): ImageResponse {
	const {
		title,
		description,
		tags,
		slug,
		authorName,
		authorAvatar,
		primaryTextColor,
		showLogo = true,
		showAuthor = true,
		...rest
	} = options;

	return new ImageResponse(
		generateBlog({
			title,
			description,
			tags,
			slug,
			authorName,
			authorAvatar,
			primaryTextColor,
			showLogo,
			showAuthor
		}),
		{
			width: 1200,
			height: 630,
			...rest
		}
	);
}

/**
 * Produce a React element representing a generic Open Graph image for the "AntiRaid" brand.
 *
 * Renders a full-bleed radial-gradient background with a logo row, uppercased tag, title, and description,
 * using the provided color for prominent text elements.
 *
 * @param primaryTextColor - CSS color used for the logo/title accent
 * @returns A ReactElement containing the composed Open Graph image (logo, tag, title, description)
 */
export function generate({
	primaryTextColor = 'rgb(255,150,255)',
	...props
}: GenerateProps): ReactElement {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				color: 'white',
				backgroundImage:
					'radial-gradient(145% 145% at 110% 110%, hsl(270,100%,86%) 0%, hsl(270,23%,20%) 30%, hsl(256, 78%, 47%, 1.00) 60%, hsl(0, 0.00%, 0.00%) 100%)'
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					padding: '4rem'
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: '24px',
						marginBottom: 'auto',
						color: primaryTextColor
					}}
				>
					<img
						src="https://avatars.githubusercontent.com/u/83183936?s=200&v=4"
						alt="AntiRaid Logo"
						width={58}
						height={58}
						style={{
							borderRadius: '8px',
							objectFit: 'contain'
						}}
					/>
					<p
						style={{
							fontSize: '46px',
							fontWeight: 600
						}}
					>
						{title}
					</p>
				</div>
				<p
					style={{
						fontWeight: 600,
						fontSize: '26px',
						textTransform: 'uppercase'
					}}
				>
					{props.tag.replace(/-/g, ' ')}
				</p>
				<p
					style={{
						fontWeight: 600,
						fontSize: '56px'
					}}
				>
					{props.title}
				</p>
				<p
					style={{
						fontSize: '28px',
						color: 'rgba(240,240,240,0.7)'
					}}
				>
					{props.description}
				</p>
			</div>
		</div>
	);
}

/**
 * Generate a React element for a blog Open Graph image.
 *
 * The rendered image uses a radial gradient background and displays the brand,
 * a "Blog Post" category line, the title, a short description, up to three tag
 * badges, and an optional author block. Titles longer than 50 characters and
 * descriptions longer than 100 characters are truncated with an ellipsis.
 *
 * @param primaryTextColor - CSS color used for prominent text and accents; defaults to 'rgb(255,150,255)'
 * @param showLogo - When true, the brand/logo row is visible; when false it is hidden
 * @param showAuthor - When true and `authorName` is provided, the author block is visible; when false it is hidden
 * @returns A React element representing the blog post Open Graph image
 */
export function generateBlog({
	primaryTextColor = 'rgb(255,150,255)',
	showLogo = true,
	showAuthor = true,
	...props
}: BlogGenerateProps): ReactElement {
	// Truncate title if too long
	const title =
		typeof props.title === 'string' && props.title.length > 50
			? props.title.substring(0, 50) + '...'
			: props.title;

	// Truncate description if too long
	const description =
		typeof props.description === 'string' && props.description && props.description.length > 100
			? props.description.substring(0, 100) + '...'
			: props.description || 'Read the latest news and updates from AntiRaid.';

	// Limit tags to prevent performance issues
	const tags = props.tags ? props.tags.slice(0, 3) : [];

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				color: 'white',
				backgroundImage:
					'radial-gradient(145% 145% at 110% 110%, hsl(270,100%,86%) 0%, hsl(270,23%,20%) 30%, hsl(256, 78%, 47%, 1.00) 60%, hsl(0, 0.00%, 0.00%) 100%)',
				position: 'relative'
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					padding: '4rem',
					position: 'relative'
				}}
			>
				{/* Logo/Brand - Always rendered with flex container */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: '16px',
						marginBottom: 'auto',
						color: primaryTextColor,
						visibility: showLogo ? 'visible' : 'hidden'
					}}
				>
					<img
						src="https://avatars.githubusercontent.com/u/83183936?s=200&v=4"
						alt="AntiRaid Logo"
						width={48}
						height={48}
						style={{
							borderRadius: '8px',
							objectFit: 'contain'
						}}
					/>
					<span
						style={{
							fontSize: '32px',
							fontWeight: 600
						}}
					>
						AntiRaid
					</span>
				</div>

				{/* Blog Category */}
				<div
					style={{
						display: 'flex',
						fontWeight: 600,
						fontSize: '24px',
						textTransform: 'uppercase',
						color: primaryTextColor,
						marginBottom: '16px'
					}}
				>
					Blog Post
				</div>

				{/* Title */}
				<div
					style={{
						display: 'flex',
						fontWeight: 700,
						fontSize: '64px',
						lineHeight: 1.1,
						marginBottom: '24px',
						textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
					}}
				>
					{title}
				</div>

				{/* Description */}
				<div
					style={{
						display: 'flex',
						fontSize: '28px',
						color: 'rgba(240,240,240,0.9)',
						lineHeight: 1.4,
						marginBottom: '32px',
						textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
					}}
				>
					{description}
				</div>

				{/* Tags - Always rendered with flex container */}
				<div
					style={{
						display: 'flex',
						gap: '12px',
						flexWrap: 'wrap',
						marginBottom: 'auto',
						visibility: tags.length > 0 ? 'visible' : 'hidden'
					}}
				>
					{tags.map((tag: string, index: number) => (
						<div
							key={index}
							style={{
								display: 'flex',
								backgroundColor: 'rgba(255, 255, 255, 0.2)',
								color: 'white',
								padding: '8px 16px',
								borderRadius: '20px',
								fontSize: '18px',
								fontWeight: '500',
								backdropFilter: 'blur(10px)'
							}}
						>
							{tag}
						</div>
					))}
				</div>

				{/* Author - Always rendered with flex container */}
				<div
					style={{
						position: 'absolute',
						bottom: '40px',
						right: '60px',
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						visibility: showAuthor && props.authorName ? 'visible' : 'hidden'
					}}
				>
					<img
						src={props.authorAvatar || 'https://via.placeholder.com/32'}
						alt={`${props.authorName || 'Author'} avatar`}
						width={32}
						height={32}
						style={{
							borderRadius: '50%',
							objectFit: 'cover',
							border: '2px solid rgba(255, 255, 255, 0.3)',
							visibility: props.authorAvatar ? 'visible' : 'hidden'
						}}
					/>
					<div
						style={{
							display: 'flex',
							fontSize: '20px',
							color: 'rgba(255, 255, 255, 0.9)',
							fontWeight: '500'
						}}
					>
						{props.authorName ? `By: ${props.authorName}` : ''}
					</div>
				</div>
			</div>
		</div>
	);
}