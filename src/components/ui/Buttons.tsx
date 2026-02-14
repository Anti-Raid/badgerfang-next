'use client';
import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { IconType as ReactIconType } from 'react-icons';
import { motion, HTMLMotionProps } from 'framer-motion';

// ============================================
// BUTTON VARIANTS & SIZE CONFIGURATION
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantStyles: Record<ButtonVariant, string> = {
	primary:
		'bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/20 border border-primary/20',
	secondary:
		'bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:border-primary/30',
	ghost: 'bg-transparent text-foreground hover:bg-accent',
	destructive:
		'bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:shadow-destructive/20',
	outline:
		'bg-transparent text-foreground border border-border hover:bg-accent hover:border-primary/30'
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: 'h-8 px-4 text-sm gap-1.5',
	md: 'h-10 px-6 text-sm gap-2',
	lg: 'h-12 px-8 text-base gap-2',
	icon: 'h-10 w-10 p-0'
};

const iconSizeMap: Record<ButtonSize, number> = {
	sm: 14,
	md: 16,
	lg: 18,
	icon: 20
};

// ============================================
// BUTTON COMPONENT
// ============================================

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'title'> {
	children?: React.ReactNode;
	Title?: string; // Legacy support
	onClick?: () => void;
	icon?: ReactIconType | LucideIcon;
	iconRight?: ReactIconType | LucideIcon;
	variant?: ButtonVariant;
	size?: ButtonSize | 'default' | 'inline' | 'small' | 'smallInline'; // Legacy size support
	loading?: boolean;
	fullWidth?: boolean;
}

// Map legacy sizes to new sizes
const legacySizeMap: Record<string, ButtonSize> = {
	default: 'md',
	inline: 'sm',
	small: 'sm',
	smallInline: 'sm'
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			Title,
			onClick,
			icon: Icon,
			iconRight: IconRight,
			variant = 'primary',
			size = 'md',
			loading = false,
			fullWidth = false,
			disabled,
			className = '',
			...rest
		},
		ref
	) => {
		// Map legacy sizes
		const mappedSize: ButtonSize = legacySizeMap[size] || (size as ButtonSize);
		const iconSize = iconSizeMap[mappedSize];
		const content = children || Title;

		// Dev warning for accessibility
		if (process.env.NODE_ENV === 'development' && !content && mappedSize !== 'icon') {
			console.warn('Button: Missing content or Title prop for accessibility.');
		}

		const baseStyles =
			'inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

		return (
			<motion.button
				ref={ref}
				type="button"
				onClick={onClick}
				disabled={disabled || loading}
				className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[mappedSize]} ${fullWidth ? 'w-full' : ''} ${className}`}
				whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -1 }}
				whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
				transition={{ duration: 0.15, ease: 'easeOut' }}
				aria-label={typeof content === 'string' ? content : undefined}
				{...rest}
			>
				{loading ? (
					<motion.span
						className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
					/>
				) : (
					<>
						{Icon && <Icon size={iconSize} className="shrink-0" />}
						{content && <span>{content}</span>}
						{IconRight && <IconRight size={iconSize} className="shrink-0" />}
					</>
				)}
			</motion.button>
		);
	}
);

Button.displayName = 'Button';

// ============================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================

export const Primary: React.FC<ButtonProps> = (props) => <Button variant="primary" {...props} />;

export const Secondary: React.FC<ButtonProps> = (props) => (
	<Button variant="secondary" {...props} />
);

export const Ghost: React.FC<ButtonProps> = (props) => <Button variant="ghost" {...props} />;

export const Destructive: React.FC<ButtonProps> = (props) => (
	<Button variant="destructive" {...props} />
);

export const Outline: React.FC<ButtonProps> = (props) => <Button variant="outline" {...props} />;

// Default export
export default Button;
