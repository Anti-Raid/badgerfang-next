'use client';

import { useEffect, useRef, useState, type JSX } from 'react';
import { Milestone, Zap, Users, Code } from 'lucide-react';
import { FaBullhorn } from 'react-icons/fa';

interface TimelineEvent {
	year: string;
	title: string;
	description: JSX.Element;
	icon: JSX.Element;
}

const timelineEvents: TimelineEvent[] = [
	{
		year: '2021',
		title: 'The Beginning',
		description: (
			<>
				AntiRaid was founded by Ilieff with a vision to create the most effective Discord server
				protection tool.
			</>
		),
		icon: <Milestone className="w-4 h-4" />
	},
	{
		year: '2023 Q4',
		title: 'New Leadership',
		description: (
			<>
				AntiRaid was acquired by{' '}
				<a
					href="https://purrquinox.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
				>
					Purrquinox
				</a>
				, bringing fresh ideas and accelerated development to the platform.
			</>
		),
		icon: <Users className="w-4 h-4" />
	},
	{
		year: '2024',
		title: 'Version 6.0',
		description: (
			<>
				A major milestone with the release of V6, introducing advanced scripting capabilities and
				customizable backups.
			</>
		),
		icon: <Zap className="w-4 h-4" />
	},
	{
		year: '2025 Q1',
		title: "Website V6.5 'Badgerfang'",
		description: (
			<>
				Launch of our completely redesigned website and dashboard with enhanced user experience and
				new features.
			</>
		),
		icon: <Code className="w-4 h-4" />
	},
	{
		year: '2025 Q2',
		title: 'AntiRaid V7',
		description: (
			<>
				Launch of our completely redesigned bot with new built-in Luau commands and comprehensive
				documentation.
			</>
		),
		icon: <FaBullhorn className="w-4 h-4" />
	},
	{
		year: '2026 Q2',
		title: 'New Website',
		description: (
			<>
				Launch of our completely redesigned website and dashboard with enhanced user experience and
				new features.
			</>
		),
		icon: <FaBullhorn className="w-4 h-4" />
	}
];

export const HistoryTimeline = () => {
	return (
		<section id="timeline" className="py-24 px-6 border-y border-border">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="mb-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
					<p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">History</p>
					<h2 className="text-3xl lg:text-4xl font-bold text-foreground">Our Journey</h2>
				</div>

				{/* Events */}
				<div>
					{timelineEvents.map((event, index) => (
						<TimelineEntry
							key={`${event.year}-${index}`}
							event={event}
							index={index}
							isLast={index === timelineEvents.length - 1}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

const TimelineEntry = ({
	event,
	index,
	isLast
}: {
	event: TimelineEvent;
	index: number;
	isLast: boolean;
}) => {
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
			{ rootMargin: '-40px' }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`flex gap-6 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
			style={{ transitionDelay: `${index * 80}ms` }}
		>
			{/* Left: dot + line */}
			<div className="flex flex-col items-center pt-1 shrink-0">
				<div className="w-2 h-2 rounded-full bg-primary shrink-0" />
				{!isLast && <div className="w-px flex-1 bg-border mt-2 mb-0" />}
			</div>

			{/* Right: content */}
			<div className={`pb-12 min-w-0 ${isLast ? 'pb-0' : ''}`}>
				<div className="flex items-center gap-2.5 mb-2">
					<span className="text-xs font-semibold text-primary tracking-wide">{event.year}</span>
					<span className="text-muted-foreground/30">{event.icon}</span>
				</div>
				<h3 className="text-xl font-bold text-foreground mb-1.5">{event.title}</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
			</div>
		</div>
	);
};
