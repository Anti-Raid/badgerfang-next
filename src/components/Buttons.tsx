'use client';
import React from 'react';

interface ButtonProps {
	Title: string;
	onClick: () => void;
}

export const Primary: React.FC<ButtonProps> = ({ Title, onClick }) => {
	return (
		<button
			className="bg-extra px-4 py-2 rounded-sm text-foreground font-semibold text-[18px] border border-white border-opacity-5 hover:brightness-[80%] transition-all"
			onClick={onClick}
		>
			{Title}
		</button>
	);
};

export const Secondary: React.FC<ButtonProps> = ({ Title, onClick }) => {
	return (
		<button
			className="bg-secondary px-4 py-2 rounded-sm text-foreground font-semibold text-[18px] border border-white border-opacity-5 hover:brightness-[80%] transition-all"
			onClick={onClick}
		>
			{Title}
		</button>
	);
};

export const Ghost: React.FC<ButtonProps> = ({ Title, onClick }) => {
	return (
		<button
			className="bg-transparent px-4 py-2 rounded-sm text-foreground font-semibold text-[18px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all"
			onClick={onClick}
		>
			{Title}
		</button>
	);
};
