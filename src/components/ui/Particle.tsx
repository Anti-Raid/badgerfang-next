import { useEffect, useState } from 'react';

interface ParticleProps {
	x: number;
	y: number;
	color: string;
}

const Particle = ({ x, y, color }: ParticleProps) => {
	const [position, setPosition] = useState({ x, y });
	const [opacity, setOpacity] = useState(1);

	useEffect(() => {
		const angle = Math.random() * Math.PI * 2;
		const velocity = 2 + Math.random() * 2;
		const lifetime = 500 + Math.random() * 500;

		const dx = Math.cos(angle) * velocity;
		const dy = Math.sin(angle) * velocity;

		const animation = setInterval(() => {
			setPosition((prev) => ({
				x: prev.x + dx,
				y: prev.y + dy
			}));
			setOpacity((prev) => Math.max(0, prev - 0.05));
		}, 16);

		const cleanup = setTimeout(() => {
			clearInterval(animation);
		}, lifetime);

		return () => {
			clearInterval(animation);
			clearTimeout(cleanup);
		};
	}, []);

	return (
		<div
			className="absolute pointer-events-none animate__animated animate__zoomOut"
			style={{
				left: position.x,
				top: position.y,
				opacity,
				transform: 'translate(-50%, -50%)'
			}}
		>
			<svg width="10" height="10" viewBox="0 0 10 10">
				<circle cx="1" cy="1" r="1" fill={color} />
			</svg>
		</div>
	);
};

export default Particle;
