'use client';

import React, { useState } from 'react';
import { Check, Copy, Palette, Type, Layout } from 'lucide-react';

// Internal helpers

const CopyToken = ({ value, label }: { value: string; label?: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={handleCopy}
			title={`Copy ${value}`}
			className="group flex items-center gap-1.5 text-xs font-mono text-muted-foreground/70 hover:text-primary transition-colors"
		>
			{copied ? (
				<Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
			) : (
				<Copy className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
			)}
			{label ?? value}
		</button>
	);
};

interface SwatchProps {
	name: string;
	cssVar: string;
	description?: string;
}

const Swatch = ({ name, cssVar, description }: SwatchProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(`hsl(var(${cssVar}))`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={handleCopy}
			className="group w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors text-left"
		>
			<div
				className="w-9 h-9 rounded-lg flex-shrink-0 border border-white/10 shadow-sm"
				style={{ background: `hsl(var(${cssVar}))` }}
				aria-hidden="true"
			/>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-foreground leading-none mb-0.5">{name}</p>
				{description && <p className="text-xs text-muted-foreground leading-none">{description}</p>}
			</div>
			<div className="flex-shrink-0 text-muted-foreground">
				{copied ? (
					<Check className="w-3.5 h-3.5 text-emerald-400" />
				) : (
					<Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
				)}
			</div>
		</button>
	);
};

// Color Palette

export const ColorPalette = () => {
	const brand = [
		{ name: 'Primary', cssVar: '--primary', description: 'Brand purple — CTAs & links' },
		{ name: 'Primary Foreground', cssVar: '--primary-foreground', description: 'Text on primary' },
		{ name: 'Secondary', cssVar: '--secondary', description: 'Supporting UI elements' },
		{ name: 'Accent', cssVar: '--accent', description: 'Hover & focus states' },
		{ name: 'Extra', cssVar: '--extra', description: 'Complementary blue' }
	];

	const surface = [
		{ name: 'Background', cssVar: '--background', description: 'Page canvas' },
		{ name: 'Card', cssVar: '--card', description: 'Elevated surfaces' },
		{ name: 'Border', cssVar: '--border', description: 'Dividers & outlines' },
		{ name: 'Muted', cssVar: '--muted', description: 'Subtle backgrounds' },
		{ name: 'Muted Foreground', cssVar: '--muted-foreground', description: 'Secondary text' }
	];

	const status = [
		{ name: 'Success', cssVar: '--success', description: 'Positive / green' },
		{ name: 'Warning', cssVar: '--warning', description: 'Caution / amber' },
		{ name: 'Destructive', cssVar: '--destructive', description: 'Error / red' }
	];

	return (
		<div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
			{/* Header */}
			<div className="px-6 pt-6 pb-4 border-b border-border">
				<div className="flex items-center gap-2.5 mb-1">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
						<Palette className="w-4 h-4 text-primary" />
					</div>
					<h3 className="text-base font-bold text-foreground">Color Palette</h3>
				</div>
				<p className="text-xs text-muted-foreground">
					All colors are CSS variables — theme-aware & composable.
				</p>
			</div>

			{/* Brand gradient preview */}
			<div className="px-6 py-4 border-b border-border">
				<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
					Brand Gradient
				</p>
				<div className="h-8 w-full rounded-xl bg-gradient-to-r from-primary via-violet-400 to-blue-500 shadow-sm" />
				<p className="text-xs font-mono text-muted-foreground/60 mt-1.5">
					from-primary via-violet-400 to-blue-500
				</p>
			</div>

			<div className="px-6 py-4 flex-1 space-y-5">
				{/* Brand */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Brand</p>
					<div className="space-y-0.5">
						{brand.map((c) => (
							<Swatch key={c.cssVar} {...c} />
						))}
					</div>
				</div>

				{/* Surface */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Surface</p>
					<div className="space-y-0.5">
						{surface.map((c) => (
							<Swatch key={c.cssVar} {...c} />
						))}
					</div>
				</div>

				{/* Status */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Status</p>
					<div className="space-y-0.5">
						{status.map((c) => (
							<Swatch key={c.cssVar} {...c} />
						))}
					</div>
				</div>
			</div>

			{/* Footer note */}
			<div className="px-6 py-3 bg-accent/20 border-t border-border">
				<p className="text-xs text-muted-foreground">
					16+ themes available — all variables update automatically.
				</p>
			</div>
		</div>
	);
};

// Typography

export const Typography = () => {
	const scale = [
		{
			label: 'Display',
			size: 'text-4xl',
			weight: 'font-extrabold',
			tracking: 'tracking-tight',
			sample: 'Discord security'
		},
		{
			label: 'H1',
			size: 'text-3xl',
			weight: 'font-bold',
			tracking: 'tracking-tight',
			sample: 'Protect your server'
		},
		{
			label: 'H2',
			size: 'text-2xl',
			weight: 'font-bold',
			tracking: '',
			sample: 'Built for communities'
		},
		{
			label: 'H3',
			size: 'text-xl',
			weight: 'font-semibold',
			tracking: '',
			sample: 'Advanced protection'
		},
		{
			label: 'Body',
			size: 'text-base',
			weight: 'font-normal',
			tracking: '',
			sample:
				'AntiRaid keeps your Discord server safe from raids, spam, and malicious users in real time.'
		},
		{
			label: 'Small',
			size: 'text-sm',
			weight: 'font-medium',
			tracking: '',
			sample: 'Uptime: 99.9% · Response: <1ms'
		},
		{
			label: 'Caption',
			size: 'text-xs',
			weight: 'font-bold',
			tracking: 'tracking-widest',
			sample: 'FEATURES · DOCS · COMMANDS'
		}
	];

	const weights = [
		{ label: 'Regular', weight: 'font-normal', val: '400' },
		{ label: 'Medium', weight: 'font-medium', val: '500' },
		{ label: 'Semibold', weight: 'font-semibold', val: '600' },
		{ label: 'Bold', weight: 'font-bold', val: '700' },
		{ label: 'Extrabold', weight: 'font-extrabold', val: '800' }
	];

	return (
		<div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
			{/* Header */}
			<div className="px-6 pt-6 pb-4 border-b border-border">
				<div className="flex items-center gap-2.5 mb-1">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
						<Type className="w-4 h-4 text-primary" />
					</div>
					<h3 className="text-base font-bold text-foreground">Typography</h3>
				</div>
				<p className="text-xs text-muted-foreground">Type scale, weights & special treatments.</p>
			</div>

			<div className="px-6 py-4 space-y-5 flex-1">
				{/* Fonts */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Fonts</p>
					<div className="grid grid-cols-2 gap-2">
						<div className="p-3 rounded-xl bg-accent/30 border border-border">
							<p className="text-xs text-muted-foreground mb-1">Sans-serif</p>
							<p className="font-sans font-extrabold text-foreground">Inter</p>
							<p className="font-sans text-xs text-muted-foreground mt-0.5">300–900 wt</p>
						</div>
						<div className="p-3 rounded-xl bg-accent/30 border border-border">
							<p className="text-xs text-muted-foreground mb-1">Monospace</p>
							<p className="font-mono font-bold text-foreground">Monocraft</p>
							<p className="font-mono text-xs text-muted-foreground mt-0.5">IDs / code</p>
						</div>
					</div>
				</div>

				{/* Gradient text */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
						Gradient Text
					</p>
					<div className="p-3 rounded-xl bg-accent/30 border border-border">
						<p className="text-2xl font-extrabold bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent leading-tight">
							reimagined.
						</p>
						<CopyToken
							value="bg-gradient-to-r from-primary via-violet-400 to-blue-500 bg-clip-text text-transparent"
							label="bg-gradient-to-r from-primary…"
						/>
					</div>
				</div>

				{/* Type scale */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
						Type Scale
					</p>
					<div className="space-y-3">
						{scale.map((item) => (
							<div key={item.label} className="flex items-baseline gap-3 min-w-0">
								<span className="text-xs font-mono text-muted-foreground/50 w-12 flex-shrink-0 tabular-nums">
									{item.label}
								</span>
								<p
									className={`${item.size} ${item.weight} ${item.tracking} text-foreground leading-tight truncate min-w-0`}
								>
									{item.sample}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Weights */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
						Font Weights
					</p>
					<div className="space-y-1.5">
						{weights.map((w) => (
							<div key={w.val} className="flex items-center justify-between">
								<span className={`text-sm ${w.weight} text-foreground`}>Inter — {w.label}</span>
								<span className="text-xs font-mono text-muted-foreground/50">{w.val}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

// UI Components

export const Buttons = () => {
	const [inputVal, setInputVal] = useState('');

	return (
		<div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
			{/* Header */}
			<div className="px-6 pt-6 pb-4 border-b border-border">
				<div className="flex items-center gap-2.5 mb-1">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center">
						<Layout className="w-4 h-4 text-primary" />
					</div>
					<h3 className="text-base font-bold text-foreground">UI Components</h3>
				</div>
				<p className="text-xs text-muted-foreground">Buttons, badges, inputs, cards & states.</p>
			</div>

			<div className="px-6 py-4 space-y-5 flex-1">
				{/* Buttons */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Buttons</p>
					<div className="space-y-2">
						<button className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
							Primary — Get Started
						</button>
						<button className="w-full px-4 py-2.5 rounded-full font-bold text-sm border border-border text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">
							Secondary — Learn More
						</button>
						<button className="w-full px-4 py-2.5 text-primary font-bold text-sm hover:underline underline-offset-4 transition-all">
							Ghost / Link →
						</button>
						<button className="w-full px-4 py-2.5 bg-destructive/10 text-destructive rounded-full font-bold text-sm border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all">
							Destructive — Delete
						</button>
					</div>
				</div>

				{/* Badges */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Badges</p>
					<div className="flex flex-wrap gap-2">
						<span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
							<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
							Live
						</span>
						<span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
							Success
						</span>
						<span className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
							Warning
						</span>
						<span className="px-2.5 py-1 text-xs font-bold bg-destructive/10 text-destructive rounded-full border border-destructive/20">
							Error
						</span>
						<span className="px-2.5 py-1 text-xs font-bold bg-muted text-muted-foreground rounded-full">
							Muted
						</span>
					</div>
				</div>

				{/* Input */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Input</p>
					<div className="space-y-2">
						<input
							type="text"
							placeholder="Search commands…"
							value={inputVal}
							onChange={(e) => setInputVal(e.target.value)}
							className="w-full px-4 py-2.5 rounded-xl bg-accent/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
						/>
					</div>
				</div>

				{/* Cards */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Cards</p>
					<div className="space-y-2">
						<div className="p-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-default">
							Default card — hover to preview
						</div>
						<div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm font-medium text-primary">
							Primary tinted surface
						</div>
						<div className="p-3 rounded-xl bg-card/60 backdrop-blur-md border border-border text-sm font-medium text-foreground">
							Glass / frosted surface
						</div>
					</div>
				</div>

				{/* Spacing */}
				<div>
					<p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
						Border Radius Scale
					</p>
					<div className="flex items-end gap-2">
						{[
							{ label: 'sm', cls: 'rounded', size: 'w-7 h-7' },
							{ label: 'md', cls: 'rounded-md', size: 'w-7 h-7' },
							{ label: 'lg', cls: 'rounded-lg', size: 'w-7 h-7' },
							{ label: 'xl', cls: 'rounded-xl', size: 'w-7 h-7' },
							{ label: '2xl', cls: 'rounded-2xl', size: 'w-7 h-7' },
							{ label: '3xl', cls: 'rounded-3xl', size: 'w-7 h-7' },
							{ label: 'full', cls: 'rounded-full', size: 'w-7 h-7' }
						].map((r) => (
							<div key={r.label} className="flex flex-col items-center gap-1">
								<div className={`${r.size} ${r.cls} bg-primary/30 border border-primary/40`} />
								<span className="text-[9px] font-mono text-muted-foreground/50 text-center">
									{r.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="px-6 py-3 bg-accent/20 border-t border-border">
				<p className="text-xs text-muted-foreground">
					All components are Tailwind-first & fully theme-aware.
				</p>
			</div>
		</div>
	);
};
