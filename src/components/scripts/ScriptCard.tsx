'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Package, Clock, GitBranch, Server, Eye, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, isValid } from 'date-fns';

interface CommonCardProps {
	template: any;
}

export const CommonCard = ({ template }: CommonCardProps) => {
	const router = useRouter();
	const cardRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(cardRef, { once: true, margin: '-50px' });

	const safeFormatDate = (dateString: string) => {
		const date = new Date(dateString);
		if (isValid(date)) {
			return format(date, 'MMM d, yyyy');
		}
		return 'Unknown';
	};

	const formattedCreatedDate = safeFormatDate(template.created_at);
	const formattedUpdatedDate = safeFormatDate(template.last_updated_at);

	return (
		<motion.div
			ref={cardRef}
			initial={{ opacity: 0, y: 10 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.3 }}
			className="group rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/30"
		>
			{/* Header */}
			<div className="p-5 border-b border-border">
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Package size={20} className="text-primary" />
						</div>
						<div>
							<h3 className="font-semibold text-foreground">{template.name}</h3>
							<p className="text-xs text-muted-foreground">v{template.version}</p>
						</div>
					</div>
				</div>
				<p className="text-sm text-muted-foreground line-clamp-2">
					{template.description}
				</p>
				{template.tags && template.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mt-3">
						{template.tags.slice(0, 3).map((tag: string, index: number) => (
							<span
								key={index}
								className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Details */}
			<div className="p-5 space-y-3">
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Server size={14} />
						<span className="truncate">{template.owner_guild?.slice(0, 10) || 'Unknown'}...</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<User size={14} />
						<span className="truncate">{template.owner_guild?.slice(0, 10) || 'Unknown'}</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Clock size={14} />
						<span>{formattedCreatedDate}</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<GitBranch size={14} />
						<span>{formattedUpdatedDate}</span>
					</div>
				</div>

				<button
					onClick={() => router.push(`/script/${template.id}`)}
					className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
				>
					<Eye size={16} />
					View Details
				</button>
			</div>
		</motion.div>
	);
};
