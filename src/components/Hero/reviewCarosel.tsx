'use client';

import { useState, useEffect, useRef } from 'react';
import { FaDiscord, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
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
			content: 'Better then the rest.',
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
			} catch (error) {
				console.error('Error fetching author data:', error);
			}
		};

		fetchAuthorData(reviews[currentIndex].authorId);
	}, [currentIndex, reviews]);

	useEffect(() => {
		const startInterval = () => {
			if (intervalRef.current) clearInterval(intervalRef.current);

			intervalRef.current = setInterval(() => {
				if (!isPaused) {
					setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
				}
			}, 6000);
		};

		startInterval();

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [reviews.length, isPaused]);

	const handleNavigation = (index: number) => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		setCurrentIndex(index);

		intervalRef.current = setInterval(() => {
			if (!isPaused) {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
			}
		}, 6000);
	};

	const renderStars = (rating: number = 0) => {
		return (
			<div className="flex space-x-1">
				{[...Array(5)].map((_, i) => (
					<svg
						key={i}
						className={`w-4 h-4 ${i < rating ? 'text-primary' : 'text-muted'}`}
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				))}
			</div>
		);
	};

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
				<div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
				<div className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
			</div>

			<div className="text-center mb-16 relative container mx-auto px-4 z-10">
				<div className="text-center mb-16 relative animate-in fade-in-0 slide-in-from-bottom-4 duration-600">
					<div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-2 shadow-lg shadow-primary/5">
						<span className="h-px w-5 bg-gradient-to-r from-transparent to-primary"></span>
						<span className="text-primary/90 text-sm font-medium tracking-wider uppercase">
							Reviews
						</span>
						<span className="h-px w-5 bg-gradient-to-r from-primary to-transparent"></span>
					</div>
				</div>

				<h2 className="text-4xl md:text-5xl font-bold mb-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 delay-100">
					Discover what our <span className="text-primary">Amazing Users</span> have to say about us
				</h2>
			</div>

			<div className="max-w-4xl mx-auto relative px-4 z-10">
				<div
					className="relative h-auto min-h-80 overflow-hidden rounded-xl p-1"
					onMouseEnter={() => setIsPaused(true)}
					onMouseLeave={() => setIsPaused(false)}
				>
					{/* key drives re-mount for entrance animation on each slide */}
					<div key={currentIndex} className="relative animate-in fade-in-0 duration-300">
						<div className="rounded-xl overflow-hidden">
							<div className="backdrop-blur-sm bg-card/80 shadow-xl shadow-primary/5 border border-border rounded-xl p-8 md:p-10">
								<div className="flex items-center justify-between mb-8">
									<div className="flex items-center space-x-4">
										<div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
											<Image
												src={authorData.avatar || '/logo.webp'}
												alt={authorData.name || 'User Avatar'}
												fill
												className="object-cover"
											/>
										</div>
										<div>
											<h3 className="font-bold text-lg">{authorData.name}</h3>
											<div className="flex items-center space-x-3">
												{reviews[currentIndex].date && (
													<span className="text-xs text-muted-foreground">
														{reviews[currentIndex].date}
													</span>
												)}
												{reviews[currentIndex].rating &&
													renderStars(reviews[currentIndex].rating)}
											</div>
										</div>
									</div>

									<a
										href={reviews[currentIndex].discordUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 hover:scale-110 active:scale-95 transition-all group"
										aria-label="View review on Discord"
									>
										<FaDiscord className="text-primary group-hover:text-primary-foreground transition-colors text-xl" />
									</a>
								</div>

								<div className="relative">
									<FaQuoteLeft className="absolute -top-3 -left-1 text-primary/20 text-3xl" />

									<div className="relative z-10 px-6 py-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-200">
										<p className="text-foreground/90 font-inter leading-relaxed text-lg">
											{reviews[currentIndex].content}
										</p>
									</div>

									<FaQuoteRight className="absolute -bottom-3 -right-1 text-primary/20 text-3xl" />
								</div>

								<div className="absolute top-12 right-12 opacity-5">
									<svg
										width="120"
										height="120"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="text-primary"
									>
										<path d="M21.85,9a2,2,0,0,0-1-1.72l-9-5.2a2,2,0,0,0-2,0l-9,5.2A2,2,0,0,0,0,9V19a2,2,0,0,0,1,1.72l9,5.2a2,2,0,0,0,2,0l9-5.2A2,2,0,0,0,22,19Z" />
									</svg>
								</div>

								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl pointer-events-none"></div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-center mt-8 space-x-2">
					{reviews.map((_, index) => (
						<button
							key={index}
							onClick={() => handleNavigation(index)}
							className={`h-3 rounded-full transition-all duration-300 hover:scale-125 active:scale-90 ${
								currentIndex === index
									? 'w-3 bg-primary shadow-lg shadow-primary/30'
									: 'w-3 bg-muted hover:bg-muted-foreground/30'
							}`}
							aria-label={`Go to review ${index + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default ReviewsCarousel;
