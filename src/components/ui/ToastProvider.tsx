'use client';
import { Toaster } from 'sonner';

interface ToastProviderProps {
	children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
	return (
		<>
			{children}
			<Toaster
				theme="dark"
				position="bottom-right"
				richColors
				closeButton
				toastOptions={{
					style: {
						background: 'hsl(var(--card) / 0.95)',
						backdropFilter: 'blur(12px)',
						border: '1px solid hsl(var(--border) / 0.5)',
						borderRadius: '0.75rem',
						boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
						color: 'hsl(var(--foreground))'
					}
				}}
			/>
		</>
	);
}
