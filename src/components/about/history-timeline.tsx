'use client';

import { useState, useEffect, useRef, type JSX } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Milestone, Zap, Users, Code } from 'lucide-react';
import { FaBullhorn } from 'react-icons/fa';

interface TimelineEvent {
	year: string;
	title: string;
	description: JSX.Element;
	icon: JSX.Element;
}

export const HistoryTimeline = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start end', 'end start']
	});
	const lineHeight = useTransform(scrollYProgress, [0, 0.9], ['0%', '100%']);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

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
			icon: <Milestone className="w-5 h-5" />
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
			icon: <Users className="w-5 h-5" />
		},
		{
			year: '2024',
			title: 'Version 6.0 Launch',
			description: (
				<>
					A major milestone with the release of V6, introducing advanced scripting capabilities and
					customizable backups.
				</>
			),
			icon: <Zap className="w-5 h-5" />
		},
		{
			year: '2025 Q1',
			title: "Website V6.5 'Badgerfang'",
			description: (
				<>
					Launch of our completely redesigned website and dashboard with enhanced user experience
					and new features.
				</>
			),
			icon: <Code className="w-5 h-5" />
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
			icon: <FaBullhorn className="w-5 h-5" />
		}
	];

	return (
		<section id="timeline" className="py-24 px-6 border-y border-border bg-card/30">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7 }}
					className="text-center mb-20"
				>
					<p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">History</p>
					<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Journey</h2>
					<p className="text-lg text-muted-foreground max-w-xl mx-auto">
						The evolution of AntiRaid through the years.
					</p>
				</motion.div>

				{/* Timeline */}
				<div className="relative max-w-4xl mx-auto" ref={containerRef}>
					{/* Central line track (desktop) */}
					<div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />
					{/* Animated fill line */}
					<motion.div
						className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-px bg-gradient-to-b from-primary to-blue-500 origin-top"
						style={{ height: lineHeight }}
					/>

					<div className="space-y-16">
						{timelineEvents.map((event, index) => (
							<TimelineEventItem key={`${event.year}-${index}`} event={event} index={index} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

const TimelineEventItem = ({ event, index }: { event: TimelineEvent; index: number }) => {
	const isEven = index % 2 === 0;
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
	const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
	const x = useTransform(scrollYProgress, [0, 0.6], isEven ? [-30, 0] : [30, 0]);

	return (
		<motion.div ref={ref} style={{ opacity }}>
			<div
				className={`flex flex-col md:flex-row items-center gap-6 ${
					isEven ? 'md:flex-row' : 'md:flex-row-reverse'
				}`}
			>
				{/* Text card */}
				<motion.div
					style={{ x }}
					className={`w-full md:w-5/12 ${isEven ? 'md:text-right' : 'md:text-left'}`}
				>
					<div
						className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3 ${
							isEven ? 'md:ml-auto' : ''
						}`}
					>
						<span className="text-xs font-bold text-primary">{event.year}</span>
					</div>
					<h3 className="text-xl font-bold text-foreground mb-2">{event.title}</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
				</motion.div>

				{/* Center icon */}
				<div className="relative z-10 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
					{/* Mobile connector line above */}
					{index > 0 && <div className="md:hidden w-px h-6 bg-border mx-auto mb-2" />}

					<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
						{event.icon}
					</div>

					{/* Mobile connector line below */}
					{index < 4 && <div className="md:hidden w-px h-6 bg-border mx-auto mt-2" />}
				</div>

				{/* Spacer for the other side on desktop */}
				<div className="hidden md:block w-5/12" />
			</div>
		</motion.div>
	);
};
