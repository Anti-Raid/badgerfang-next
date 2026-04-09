'use client';

import { useState, useEffect, useRef } from 'react';
import { FaDiscord } from 'react-icons/fa';
import Image from 'next/image';

export interface ReviewData {
	content: string;
	discordUrl: string;
	authorId: string;
	rating?: number;
	date?: string;
}

export const ReviewsCarousel = () => {
	const reviews: ReviewData[] = [
		{
			content:
				"I've been using AntiRaid for a bit now, and it's honestly one of those tools you don't think about much once it's set up, which is a good thing. It handles raids and spam pretty quickly, and I haven't had issues with it flagging normal users or being overly aggressive. The setup was straightforward, and while there are some settings to tweak, it never felt overwhelming. It's not flashy, but its reliable, and that's really what matters for something like this.",
			discordUrl: '',
			authorId: '787241442770419722',
			rating: 5,
			date: 'March 29, 2025'
		}
	];

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [authorData, setAuthorData] = useState({ name: '', avatar: '' });
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const authorCache = useRef<{ [key: string]: { name: string; avatar: string } }>({});

	useEffect(() => {
		const fetchAuthorData = async (authorId: string) => {
			if (authorCache.current[authorId]) {
				setAuthorData(authorCache.current[authorId]);
				return;
			}
			try {
				const response = await fetch(`https://japi.rest/discord/v1/user/${authorId}`);
				const data = await response.json();
				const authorInfo = {
					name: data.data.global_name || data.data.username,
					avatar: data.data.avatarURL
				};
				authorCache.current[authorId] = authorInfo;
				setAuthorData(authorInfo);
			} catch {}
		};
		fetchAuthorData(reviews[currentIndex].authorId);
	}, [currentIndex]);

	useEffect(() => {
		intervalRef.current = setInterval(() => {
			if (!isPaused) setCurrentIndex((i) => (i + 1) % reviews.length);
		}, 6000);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [reviews.length, isPaused]);

	const handleNavigation = (index: number) => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		setCurrentIndex(index);
		intervalRef.current = setInterval(() => {
			if (!isPaused) setCurrentIndex((i) => (i + 1) % reviews.length);
		}, 6000);
	};

	const review = reviews[currentIndex];

	return (
		<section className="py-20">
			<div className="max-w-2xl mx-auto px-4">
				{/* Header */}
				<div className="mb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
					<p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Reviews</p>
					<h2 className="text-3xl lg:text-4xl font-bold text-foreground">What our users say</h2>
				</div>

				{/* Review */}
				<div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
					<div key={currentIndex} className="animate-in fade-in-0 duration-300">
						<div className="relative rounded-2xl border border-border bg-card overflow-hidden p-8">
							{/* Decorative quote mark */}
							<span
								className="absolute -top-4 -left-1 text-[160px] font-serif leading-none text-primary/5 select-none pointer-events-none"
								aria-hidden="true"
							>
								"
							</span>

							<div className="relative">
								{/* Stars */}
								{review.rating && (
									<div className="flex gap-1 mb-6">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`w-4 h-4 ${i < review.rating! ? 'text-primary' : 'text-border'}`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
								)}

								{/* Quote */}
								<p className="text-2xl font-semibold text-foreground leading-snug mb-8">
									{review.content}
								</p>

								{/* Divider */}
								<div className="h-px bg-border mb-6" />

								{/* Attribution */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
											<Image
												src={authorData.avatar || '/logo.webp'}
												alt={authorData.name || 'User'}
												width={40}
												height={40}
												className="object-cover"
											/>
										</div>
										<div>
											<p className="text-sm font-semibold text-foreground leading-tight">
												{authorData.name || '—'}
											</p>
											{review.date && (
												<p className="text-xs text-muted-foreground mt-0.5">{review.date}</p>
											)}
										</div>
									</div>

									{review.discordUrl && (
										<a
											href={review.discordUrl}
											target="_blank"
											rel="noopener noreferrer"
											aria-label="View on Discord"
											className="text-muted-foreground/40 hover:text-primary transition-colors"
										>
											<FaDiscord className="w-4 h-4" />
										</a>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Dots */}
				{reviews.length > 1 && (
					<div className="flex gap-2 mt-10">
						{reviews.map((_, i) => (
							<button
								key={i}
								onClick={() => handleNavigation(i)}
								className={`h-1 rounded-full transition-all duration-300 ${
									currentIndex === i
										? 'w-6 bg-primary'
										: 'w-2 bg-border hover:bg-muted-foreground/30'
								}`}
								aria-label={`Review ${i + 1}`}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default ReviewsCarousel;
