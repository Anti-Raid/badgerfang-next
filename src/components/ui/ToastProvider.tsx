'use client';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

interface ToastProviderProps {
	children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
	return (
		<>
			{children}
			<ToastContainer
				theme="dark"
				role="alert"
				aria-live="assertive"
				position="bottom-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				style={{
					zIndex: 9999
				}}
				toastStyle={{
					background: 'hsl(var(--card) / 0.95)',
					backdropFilter: 'blur(12px)',
					border: '1px solid hsl(var(--border) / 0.5)',
					borderRadius: '0.75rem',
					boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
					color: 'hsl(var(--foreground))'
				}}
				progressClassName="toast-progress-bar"
			/>
		</>
	);
}
