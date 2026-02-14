import React from 'react';

export const ColorPalette = () => {
	const colors = [
		{ name: 'Primary', class: 'bg-primary' },
		{ name: 'Secondary', class: 'bg-secondary' },
		{ name: 'Accent', class: 'bg-accent' },
		{ name: 'Background', class: 'bg-background' },
		{ name: 'Foreground', class: 'bg-foreground' },
		{ name: 'Success', class: 'bg-success' },
		{ name: 'Warning', class: 'bg-warning' }
	];

	return (
		<div className="card bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-semibold mb-4">Color Palette</h3>
			<div className="space-y-3">
				{colors.map((color) => (
					<div key={color.name} className="flex items-center">
						<div className={`w-10 h-10 rounded-lg ${color.class} mr-3`} aria-hidden="true"></div>
						<span className="text-foreground/80">{color.name}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export const Typography = () => {
	return (
		<div className="card bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-semibold mb-4">Typography</h3>
			<div className="space-y-4">
				<div>
					<p className="text-sm text-foreground/70 mb-1">Primary Font</p>
					<p className="font-sans font-semibold text-xl">Inter</p>
				</div>
				<div>
					<p className="text-sm text-foreground/70 mb-1">Monospace</p>
					<p className="font-mono">Monocraft</p>
				</div>
			</div>
		</div>
	);
};

export const Buttons = () => {
	return (
		<div className="card bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-semibold mb-4">Buttons</h3>
			<div className="space-y-4">
				<button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
					Primary Button
				</button>
				<button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
					Secondary Button
				</button>
				<button className="w-full px-4 py-2 bg-background border border-primary/30 text-foreground rounded-lg font-semibold hover:border-primary/50 transition-colors">
					Outline Button
				</button>
			</div>
		</div>
	);
};
