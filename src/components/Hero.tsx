'use client';
import { ArrowUpRight } from 'lucide-react';
import { api_url } from './common';
import { useEffect, useState } from 'react';

const Hero = () => {
	interface StatisticsData {
		resp: {
			uptime: number;
			managers: {
				display_name: string;
				shard_groups: {
					shards: Array<[number, number, number, number, number, number]>; // shards' data structure
				}[];
			}[];
		};
		shard_conns: {
			[key: number]: {
				status: 'MarkedForClosure' | 'Active';
				real_latency: number;
				guilds: number;
				uptime: number;
				total_uptime: number;
			};
		};
		total_guilds: number;
	}

	const [serverCount, setServerCount] = useState(0);
	const [stats, setStats] = useState<StatisticsData | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch(`${api_url}/bot-stats`);
				if (response.ok) {
					const data: StatisticsData = await response.json();
					setStats(data);
				} else {
					console.error('Failed to fetch stats');
				}
			} catch (error) {
				console.error('Error fetching stats:', error);
			}
		};

		fetchStats();
	}, []);

	useEffect(() => {
		if (!stats?.total_guilds) return;

		const targetCount = stats.total_guilds;
		const increment = targetCount / 150;

		const updateCount = () => {
			setServerCount((prevCount) => {
				if (prevCount < targetCount) {
					const newCount = Math.ceil(prevCount + increment);
					return newCount >= targetCount ? targetCount : newCount;
				}
				return prevCount;
			});
		};

		const intervalId = setInterval(updateCount, 10);

		return () => clearInterval(intervalId);
	}, [stats?.total_guilds]);

	return (
		<>
			<section>
				<main className="container mx-auto px-4 py-16">
					{/* Top label */}
					<div className="text-center mb-8 opacity-80">
						<span className="text-gray-400 inline-flex items-center gap-4 font-inter text-xs font-normal">
							<span className="h-px w-14 bg-gradient-to-r to-gray-500 relative from-transparent">
								<span className="w-[5px] h-[5px] bg-gray-500 absolute rounded top-1/2 -translate-y-1/2 right-0"></span>
							</span>
							Most Trusted Security
							<span className="h-px w-14 bg-gradient-to-r from-gray-500 to-transparent relative">
								<span className="w-[5px] h-[5px] bg-gray-500 absolute rounded top-1/2 -translate-y-1/2 left-0"></span>
							</span>
						</span>
					</div>

					{/* Hero Section */}
					<div className="max-w-4xl relative mx-auto text-center space-y-8">
						<div className="w-[5rem] h-[10rem] absolute bottom-[-5rem] left-[5rem] blur-[6rem] opacity-50 bg-violet-600"></div>
						<div className="w-[5rem] h-[10rem] absolute bottom-[-5rem] right-[5rem] blur-[6rem] opacity-50 bg-violet-600"></div>

						<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4 font-inter">
							Easily Protect Your Discord Server with{' '}
							<span className="bg-gradient-to-tl from-[#7f7dde] to-purple-50 bg-clip-text text-transparent italic font-lora font-light px-2">
								AntiRaid
							</span>
						</h1>

						<p className="text-gray-400 mb-10 font-inter text-sm font-bold">
							Join the other{' '}
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-red-400">
								{serverCount.toLocaleString('en-US')}+
							</span>{' '}
							servers that use AntiRaid and protect your server today!
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-row max-[380px]:flex-col gap-4 justify-center">
							<button className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-foreground rounded-lg font-medium transition-colors border border-gray-600 border-opacity-30">
								Invite now
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</button>
							<button className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-foreground rounded-lg font-medium transition-colors border border-gray-600 border-opacity-30">
								Learn more
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Trusted By Section */}
					<div className="mt-8 text-center">
						<div className="text-center mb-8 opacity-80">
							<span className="text-gray-400 font-inter text-xs font-normal inline-flex items-center gap-4">
								<span className="h-px w-14 bg-gradient-to-r to-gray-500 relative from-transparent">
									<span className="w-[5px] h-[5px] bg-gray-500 absolute rounded top-1/2 -translate-y-1/2 right-0"></span>
								</span>
								Trusted by biggest servers
								<span className="h-px w-14 bg-gradient-to-r from-gray-500 to-transparent relative">
									<span className="w-[5px] h-[5px] bg-gray-500 absolute rounded top-1/2 -translate-y-1/2 left-0"></span>
								</span>
							</span>
						</div>

						{/* Discord Server Icons */}
						<div className="flex justify-center gap-8 mt-8">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center"
								>
									<svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
										<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
									</svg>
								</div>
							))}
						</div>
					</div>
				</main>
			</section>
		</>
	);
};

export { Hero };
