import React from 'react';

export const ColorPalette = () => {
	const colors = [
		{ name: 'Primary', class: 'bg-primary' },
		{ name: 'Secondary', class: 'bg-secondary' },
		{ name: 'Accent', class: 'bg-accent' },
		{ name: 'Background', class: 'bg-background' },
		{ name: 'Foreground', class: 'bg-foreground' }
	];

	return (
		<div className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-monster font-bold mb-4">Color Palette</h3>
			<div className="space-y-3">
				{colors.map((color) => (
					<div key={color.name} className="flex items-center">
						<div className={`w-10 h-10 rounded-md ${color.class} mr-3`}></div>
						<span className="text-foreground/80">{color.name}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export const Typography = () => {
	return (
		<div className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-monster font-bold mb-4">Typography</h3>
			<div className="space-y-4">
				<div>
					<p className="text-sm text-foreground/70 mb-1">Heading</p>
					<p className="font-monster font-bold text-xl">Montserrat</p>
				</div>
				<div>
					<p className="text-sm text-foreground/70 mb-1">Body</p>
					<p className="font-cabin">Cabin</p>
				</div>
				<div>
					<p className="text-sm text-foreground/70 mb-1">Alternative</p>
					<p className="font-inter">Inter</p>
				</div>
			</div>
		</div>
	);
};

export const Buttons = () => {
	return (
		<div className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6">
			<h3 className="text-xl font-monster font-bold mb-4">Buttons</h3>
			<div className="space-y-4">
				<button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold">
					Primary Button
				</button>
				<button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-semibold">
					Secondary Button
				</button>
				<button className="w-full px-4 py-2 bg-background border border-primary/30 text-foreground rounded-md font-semibold">
					Outline Button
				</button>
			</div>
		</div>
	);
};