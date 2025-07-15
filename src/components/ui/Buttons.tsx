'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconType as ReactIconType } from 'react-icons';

// Extend ButtonProps for accessibility and native button support
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	Title: string;
	onClick: () => void;
	icon?: ReactIconType | LucideIcon;
}

const baseClass =
	'px-5 py-2.5 w-full max-w-[160px] rounded-sm text-foreground font-medium text-[16px] border border-white border-opacity-5 hover:brightness-[80%] transition-all inline-flex justify-center items-center gap-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary';

export const Primary: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-extra ${baseClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-[18px]" />} {Title}
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
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-secondary ${baseClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-[18px]" />} {Title}
		</button>
	);
};

export const Ghost: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-transparent px-4 py-2 rounded-sm text-foreground font-semibold text-[16px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all flex items-center gap-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-[18px]" />} {Title}
		</button>
	);
};

export const InlineGhost: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-transparent px-4 py-2 rounded-sm text-foreground font-semibold text-[12px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all gap-1 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-[18px]" />} {Title}
		</button>
	);
};

export const SmallGhost: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-transparent rounded-sm text-foreground font-semibold text-[12px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all flex items-center gap-1 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-[14px]" />} {Title}
		</button>
	);
};


export const SmallInlineGhost: React.FC<ButtonProps> = ({
	Title,
	onClick,
	icon: Icon,
	disabled,
	'aria-label': ariaLabel,
	type = 'button',
	...rest
}) => {
	if (process.env.NODE_ENV === 'development' && (!Title || Title.trim() === '')) {
		console.warn(
			'Button component: Title prop is missing or empty. This is required for accessibility.'
		);
	}
	return (
		<button
			className={`bg-transparent rounded-sm text-foreground font-semibold text-[12px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all gap-1 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			type={type}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || Title}
			{...rest}
		>
			{Icon && <Icon className="text-[14px]" />} {Title}
		</button>
	);
};