import type { ImageResponseOptions } from 'next/dist/compiled/@vercel/og/types';
import { ImageResponse } from 'next/og';
import type { ReactElement, ReactNode } from 'react';

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

export function generateOGImage(options: GenerateProps & ImageResponseOptions): ImageResponse {
	const { title, tag, description, primaryTextColor, ...rest } = options;
	return new ImageResponse(
		generate({ title, tag, description, primaryTextColor }),
		{ width: 1200, height: 630, ...rest }
	);
}

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
		generateBlog({ title, description, tags, slug, authorName, authorAvatar, primaryTextColor, showLogo, showAuthor }),
		{ width: 1200, height: 630, ...rest }
	);
}

export function generate({ primaryTextColor = '#a855f7', ...props }: GenerateProps): ReactElement {
	return (
		<div
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				background: '#08080f',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Grid texture */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'linear-gradient(rgba(168,85,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.06) 1px, transparent 1px)',
					backgroundSize: '60px 60px',
				}}
			/>
			{/* Radial glow */}
			<div
				style={{
					position: 'absolute',
					top: '-200px',
					right: '-200px',
					width: '700px',
					height: '700px',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
				}}
			/>
			{/* Content */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					padding: '64px 72px',
					position: 'relative',
				}}
			>
				{/* Top bar */}
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
						<img
							src="https://avatars.githubusercontent.com/u/83183936?s=200&v=4"
							width={44}
							height={44}
							style={{ borderRadius: '10px', objectFit: 'contain' }}
						/>
						<span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
							AntiRaid
						</span>
					</div>
					<span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
						antiraid.xyz
					</span>
				</div>

				{/* Tag label */}
				<div
					style={{
						display: 'flex',
						fontSize: '15px',
						fontWeight: 700,
						textTransform: 'uppercase',
						letterSpacing: '3px',
						color: primaryTextColor,
						marginBottom: '20px',
					}}
				>
					{props.tag.replace(/-/g, ' ')}
				</div>

				{/* Title */}
				<div
					style={{
						display: 'flex',
						fontSize: '68px',
						fontWeight: 800,
						color: '#ffffff',
						lineHeight: 1.05,
						letterSpacing: '-2px',
						marginBottom: '24px',
					}}
				>
					{props.title}
				</div>

				{/* Description */}
				{props.description && (
					<div
						style={{
							display: 'flex',
							fontSize: '26px',
							color: 'rgba(255,255,255,0.55)',
							lineHeight: 1.5,
						}}
					>
						{props.description}
					</div>
				)}
			</div>

			{/* Left accent bar */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: '15%',
					bottom: '15%',
					width: '4px',
					background: 'linear-gradient(180deg, transparent, #a855f7, #6366f1, transparent)',
					borderRadius: '0 4px 4px 0',
				}}
			/>
		</div>
	);
}

export function generateBlog({
	primaryTextColor = '#a855f7',
	showLogo = true,
	showAuthor = true,
	...props
}: BlogGenerateProps): ReactElement {
	const displayTitle =
		typeof props.title === 'string' && props.title.length > 52
			? props.title.substring(0, 52) + '…'
			: props.title;

	const displayDesc =
		typeof props.description === 'string' && props.description.length > 110
			? props.description.substring(0, 110) + '…'
			: props.description || 'Read the latest from AntiRaid.';

	const tags = (props.tags ?? []).slice(0, 3);

	return (
		<div
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				background: '#08080f',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Grid texture */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage:
						'linear-gradient(rgba(168,85,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.07) 1px, transparent 1px)',
					backgroundSize: '56px 56px',
				}}
			/>

			{/* Top-right radial glow */}
			<div
				style={{
					position: 'absolute',
					top: '-180px',
					right: '-180px',
					width: '650px',
					height: '650px',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, rgba(99,102,241,0.12) 50%, transparent 70%)',
				}}
			/>

			{/* Bottom-left secondary glow */}
			<div
				style={{
					position: 'absolute',
					bottom: '-120px',
					left: '-80px',
					width: '400px',
					height: '400px',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
				}}
			/>

			{/* Left accent bar */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: '12%',
					bottom: '12%',
					width: '4px',
					background: 'linear-gradient(180deg, transparent, #a855f7 30%, #6366f1 70%, transparent)',
					borderRadius: '0 4px 4px 0',
				}}
			/>

			{/* Main content */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
					padding: '56px 72px 52px 72px',
					position: 'relative',
				}}
			>
				{/* Header row */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 'auto',
						opacity: showLogo ? 1 : 0,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
						<img
							src="https://avatars.githubusercontent.com/u/83183936?s=200&v=4"
							width={40}
							height={40}
							style={{ borderRadius: '9px', objectFit: 'contain' }}
						/>
						<span style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
							AntiRaid
						</span>
					</div>

					{/* "Blog" pill badge */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							padding: '8px 18px',
							background: 'rgba(168,85,247,0.15)',
							border: '1px solid rgba(168,85,247,0.30)',
							borderRadius: '100px',
						}}
					>
						<div
							style={{
								width: '7px',
								height: '7px',
								borderRadius: '50%',
								background: primaryTextColor,
							}}
						/>
						<span style={{ fontSize: '15px', fontWeight: 700, color: primaryTextColor, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
							Blog
						</span>
					</div>
				</div>

				{/* Title */}
				<div
					style={{
						display: 'flex',
						fontSize: '62px',
						fontWeight: 800,
						color: '#ffffff',
						lineHeight: 1.08,
						letterSpacing: '-2px',
						marginBottom: '20px',
					}}
				>
					{displayTitle}
				</div>

				{/* Description */}
				<div
					style={{
						display: 'flex',
						fontSize: '24px',
						color: 'rgba(255,255,255,0.50)',
						lineHeight: 1.55,
						marginBottom: '32px',
					}}
				>
					{displayDesc}
				</div>

				{/* Tags */}
				{tags.length > 0 && (
					<div style={{ display: 'flex', gap: '10px', marginBottom: '36px' }}>
						{tags.map((tag, i) => (
							<div
								key={i}
								style={{
									display: 'flex',
									padding: '6px 16px',
									background: 'rgba(168,85,247,0.12)',
									border: '1px solid rgba(168,85,247,0.25)',
									borderRadius: '100px',
									fontSize: '16px',
									fontWeight: 600,
									color: 'rgba(216,180,254,0.9)',
									letterSpacing: '0.2px',
								}}
							>
								{tag}
							</div>
						))}
					</div>
				)}

				{/* Divider */}
				<div
					style={{
						display: 'flex',
						height: '1px',
						background: 'rgba(255,255,255,0.08)',
						marginBottom: '28px',
					}}
				/>

				{/* Author + domain footer */}
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					{/* Author */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							opacity: showAuthor && props.authorName ? 1 : 0,
						}}
					>
						{props.authorAvatar ? (
							<img
								src={props.authorAvatar}
								width={36}
								height={36}
								style={{
									borderRadius: '50%',
									objectFit: 'cover',
									border: '2px solid rgba(168,85,247,0.4)',
								}}
							/>
						) : (
							<div
								style={{
									width: '36px',
									height: '36px',
									borderRadius: '50%',
									background: 'rgba(168,85,247,0.2)',
									border: '2px solid rgba(168,85,247,0.35)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							/>
						)}
						<span style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>
							{props.authorName}
						</span>
					</div>

					<span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
						antiraid.xyz
					</span>
				</div>
			</div>
		</div>
	);
}
