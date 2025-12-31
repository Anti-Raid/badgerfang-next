'use client';

import { useEffect, useState } from 'react';

interface Snowflake {
	id: number;
	left: number;
	animationDuration: number;
	opacity: number;
	size: number;
}

/**
 * Renders a beautiful winter snowfall effect across the screen
 * Creates randomly positioned snowflakes with varying speeds and sizes
 */
export default function Snowfall() {
	const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

	useEffect(() => {
		// Create 50 snowflakes with random properties
		const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: Math.random() * 100, // Random horizontal position (0-100%)
			animationDuration: Math.random() * 10 + 10, // Random fall duration (10-20s)
			opacity: Math.random() * 0.6 + 0.4, // Random opacity (0.4-1)
			size: Math.random() * 0.8 + 0.5, // Random size (0.5-1.3em)
		}));
		setSnowflakes(flakes);
	}, []);

	return (
		<div className="snowfall" aria-hidden="true">
			{snowflakes.map((flake) => (
				<div
					key={flake.id}
					className="snowflake"
					style={{
						left: `${flake.left}%`,
						animationDuration: `${flake.animationDuration}s`,
						opacity: flake.opacity,
						fontSize: `${flake.size}em`,
						animationDelay: `${Math.random() * 5}s`, // Stagger the start times
					}}
				>
					❄
				</div>
			))}
		</div>
	);
}
