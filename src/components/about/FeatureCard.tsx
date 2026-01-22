import { motion } from '@/components/ui/motion';
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
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
			transition={{ duration: 0.5, delay }}
			className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-[0_5px_15px_rgba(var(--primary)/10%)] group"
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
		</motion.div>
	);
};
