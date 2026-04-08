'use client';

import React from 'react';

type FeatureCardProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay?: number;
	isLoaded?: boolean;
};

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
	return (
		<div className="p-6 rounded-xl border border-border bg-card transition-colors hover:border-primary/30">
			<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
				{icon}
			</div>
			<h3 className="font-semibold text-foreground mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
		</div>
	);
};
