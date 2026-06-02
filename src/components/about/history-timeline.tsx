'use client';

import { JSX } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Milestone, Zap, Users, Code, ChevronDown } from 'lucide-react';
import { FaBullhorn } from 'react-icons/fa';

interface TimelineEvent {
	year: string;
	title: string;
	description: JSX.Element;
	icon: JSX.Element;
}

export const HistoryTimeline = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isSectionVisible, setIsSectionVisible] = useState(false);

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsSectionVisible(true);
					observer.disconnect();
				}
			},
			{
				threshold: 0.2
			}
		);

		observer.observe(element);
		return () => observer.disconnect();
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
			icon: <Milestone className="w-6 h-6" />
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
						className="underline bg-primary hover:bg-primary/80 hover:underline-offset-2 transition-all duration-200"
					>
						Purrquinox
					</a>
					, bringing fresh ideas and accelerated development to the platform.
				</>
			),
			icon: <Users className="w-6 h-6" />
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
			icon: <Zap className="w-6 h-6" />
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
			icon: <Code className="w-6 h-6" />
		},
		{
			year: '2025 Q2',
			title: 'AntiRaid V7',
			description: (
				<>
					Launch of our completely redesigned bot with new BuiltIns commands in Luau and docs for
					enhanced user experience and new features.
				</>
			),
			icon: <FaBullhorn className="w-6 h-6" />
		}
	];

	return (
		<section id="timeline" className="py-24 relative overflow-hidden">
			{/* Cyberpunk background elements */}
			<div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background/80"></div>

			{/* Animated circuit lines */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-0 left-1/4 w-[1px] h-full bg-primary"></div>
				<div className="absolute top-0 left-3/4 w-[1px] h-full bg-primary"></div>
				<div className="absolute top-1/4 left-0 w-full h-[1px] bg-primary"></div>
				<div className="absolute top-3/4 left-0 w-full h-[1px] bg-primary"></div>
			</div>

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
				<div className="text-center mb-20">
					<div
						className={`relative transition-all duration-700 ease-out ${
							isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
						}`}
					>
						<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

						<h2 className="text-4xl md:text-5xl font-monster font-bold mb-3 glitch-text relative">
							<span className="relative z-10">Our Journey</span>
							<span className="absolute inset-0 text-primary/20 translate-x-[2px] translate-y-[2px] z-0">
								Our Journey
							</span>
						</h2>

						<p className="text-lg text-foreground/70 ml-2 font-mono">
							The evolution of AntiRaid through the years
						</p>

						<div className="w-20 h-1 bg-primary mx-auto mt-6 relative">
							<div className="absolute -left-2 -top-2 w-4 h-4 bg-background border-2 border-primary"></div>
							<div className="absolute -right-2 -top-2 w-4 h-4 bg-background border-2 border-primary"></div>
						</div>

						<div className="absolute -bottom-12 w-full flex justify-center text-primary animate-bounce">
							<ChevronDown className="w-8 h-8" />
						</div>
					</div>
				</div>

				<div className="relative max-w-4xl mx-auto">
					{/* Desktop central line */}
					<div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/10"></div>
					<div
						className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/50 origin-top transition-transform duration-1000 ease-out ${
							isSectionVisible ? 'scale-y-100' : 'scale-y-0'
						}`}
					/>

					{timelineEvents.map((event, index) => (
						<div key={`${event.year}-${index}`} className="mb-16 last:mb-0">
							<TimelineEvent event={event} index={index} />
							{index < timelineEvents.length - 1 && <TimelineConnector />}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

interface TimelineEventProps {
	event: TimelineEvent;
	index: number;
}

const TimelineEvent = ({ event, index }: TimelineEventProps) => {
	const isEven = index % 2 === 0;
	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{
				threshold: 0.25,
				rootMargin: '0px 0px -10% 0px'
			}
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={containerRef}
			className={`relative transform-gpu transition-all duration-700 ease-out ${
				isVisible
					? 'opacity-100 translate-x-0'
					: isEven
						? '-translate-x-8 opacity-0'
						: 'translate-x-8 opacity-0'
			}`}
			style={{ transitionDelay: `${index * 120}ms` }}
		>
			<div
				className={`flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
			>
				{/* Text Content */}
				<div
					className={`w-full md:w-5/12 ${isEven ? 'text-right pr-4 md:pr-8' : 'text-left pl-4 md:pl-8'}`}
				>
					<div className="inline-block mb-3 mr-3 px-3 py-1 bg-primary/20 rounded-none border border-primary/50 text-primary text-sm font-mono font-semibold relative overflow-hidden group">
						<div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
						<span className="relative z-10">{event.year}</span>
						<span className="absolute top-0 right-0 h-full w-1 bg-primary"></span>
						<span className="absolute bottom-0 left-0 h-1 w-full bg-primary"></span>
					</div>

					<h3 className="text-xl md:text-2xl font-monster font-bold mb-2 relative inline-block group">
						{event.title}
						<span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-[2px] bg-primary transition-all duration-300"></span>
					</h3>

					<p className="text-sm md:text-base text-foreground/70 font-mono relative pl-0 group-hover:pl-4 transition-all duration-300">
						<span className="text-primary opacity-0 group-hover:opacity-100 absolute left-0 transition-opacity duration-300">
							&gt;
						</span>
						{event.description}
					</p>
				</div>

				{/* Icon with mobile line segments */}
				<div className="flex flex-col items-center md:my-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10">
					{/* Top line segment on mobile */}
					<div className="block md:hidden w-1 h-6 bg-primary/30" />

					{/* Icon Box */}
					<div className="w-14 h-14 rounded-none bg-background border-2 border-primary flex items-center justify-center relative group my-4 md:my-0">
						{/* Animated corner accents */}
						<span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary"></span>
						<span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary"></span>
						<span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary"></span>
						<span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary"></span>

						{/* Pulsing glow */}
						<div className="absolute inset-0 bg-primary/20 z-0 animate-pulse-glow" />

						{/* Icon content */}
						<div className="relative z-10 text-primary">{event.icon}</div>
					</div>

					{/* Bottom line segment on mobile */}
					<div className="block md:hidden w-1 h-6 bg-primary/30" />
				</div>
			</div>
		</div>
	);
};

const TimelineConnector = () => {
	return (
		<div className="flex justify-center relative">
			<div className="w-1 h-16 bg-primary/40 z-0 relative">
				{/* Animated data flow effect */}
				<div className="absolute top-0 left-0 w-full h-4 bg-primary/80 animate-scan" />
			</div>
		</div>
	);
};
