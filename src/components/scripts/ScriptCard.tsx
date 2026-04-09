'use client';

import { useRef, useState, useEffect } from 'react';
import { Package, Clock, GitBranch, Server, Eye, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, isValid } from 'date-fns';

interface CommonCardProps {
	template: any;
}

export const CommonCard = ({ template }: CommonCardProps) => {
	const router = useRouter();
	const ref = useRef<HTMLDivElement>(null);
	const [show, setShow] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setShow(true);
					obs.disconnect();
				}
			},
			{ rootMargin: '-50px' }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

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
		<div
			ref={ref}
			className={`transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30`}
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
				<p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
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
		</div>
	);
};
