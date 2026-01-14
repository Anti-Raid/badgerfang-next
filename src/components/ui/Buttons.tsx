'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconType as ReactIconType } from 'react-icons';

// Extend ButtonProps for accessibility and native button support
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	Title: string;
	onClick?: () => void;
	icon?: ReactIconType | LucideIcon;
	size?: 'default' | 'inline' | 'small' | 'smallInline';
	className?: string;
}

const baseClass =
	'px-6 py-3 w-fit min-w-[140px] rounded-full font-bold text-sm transition-all duration-300 inline-flex justify-center items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white shadow-lg overflow-hidden relative group';

export const Primary: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	className = '',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-primary text-primary-foreground hover:shadow-primary/30 border border-primary/20 ${baseClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${className}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
			{Icon && <Icon className="text-lg relative z-10" />} 
			<span className="relative z-10">{Title}</span>
		</button>
	);
};

export const Secondary: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	className = '',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-white/5 text-foreground hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-xl backdrop-blur-md ${baseClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${className}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-lg" />} {Title}
		</button>
	);
};

const baseGhostClass =
	'bg-transparent rounded-full text-foreground font-semibold hover:bg-white/5 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary';

const sizeClasses: Record<string, string> = {
	default: 'px-4 py-2 text-[16px]',
	inline: 'px-4 py-2 text-[12px] gap-1',
	small: 'px-0 py-1 text-[12px] gap-1',
	smallInline: 'px-0 py-1 text-[12px] gap-1'
};

const iconSizes: Record<string, string> = {
	default: 'text-[18px]',
	inline: 'text-[18px]',
	small: 'text-[14px]',
	smallInline: 'text-[14px]'
};

export const Ghost: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	size = 'default',
	className = '',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}

	return (
		<button
			className={`${baseGhostClass} ${sizeClasses[size]} ${
				disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
			} ${className}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className={iconSizes[size]} />} {Title}
		</button>
	);
};
