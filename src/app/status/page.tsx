'use client';

import React, { useEffect, useState } from 'react';
import Status from '@/components/status/Layout';
import { getBotStats } from '@/lib/api';

// Error Fallback Component
const ErrorFallback = ({ error }: { error: Error }) => (
	<div className="flex justify-center items-center min-h-screen text-destructive">
		<div>
			<p>Failed to load bot status</p>
			<p className="text-sm">{error.message}</p>
		</div>
	</div>
);

const BotStatusPage: React.FC = () => {
	const [data, setData] = useState<any>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await getBotStats();
				setData(response);
			} catch (err) {
				setError(err as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (error) return <ErrorFallback error={error} />;
	return data ? <Status data={{ resp: data }} /> : null;
};

export default BotStatusPage;
function setLoading(arg0: boolean) {
	throw new Error('Function not implemented.');
}
