import React from 'react';

// Feature Card Component
type FeatureCardProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay: number;
	isLoaded: boolean;
};

export const FeatureCard = ({ icon, title, description, delay, isLoaded }: FeatureCardProps) => {
	if (!isLoaded) return null;

	return (
		<div
			style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
			className="animate-in fade-in slide-in-from-bottom-5 duration-500 bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-[0_5px_15px_rgba(var(--primary)/10%)] group"
		>
			<div className="flex items-start">
				<div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-all">
					{icon}
				</div>
				<div className="ml-5">
					<h3 className="text-xl font-monster font-bold mb-2">{title}</h3>
					<p className="text-foreground/70 leading-relaxed">{description}</p>
				</div>
			</div>
		</div>
	);
};
