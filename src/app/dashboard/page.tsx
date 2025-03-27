'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Servers from '@/components/dashboard/all-servers';

export const runtime = 'edge';

export default function Dashboard() {
    const searchParams = useSearchParams();
    const refresh = searchParams.get('refresh') === 'true';

    const [key, setKey] = useState(0);

    useEffect(() => {
        if (refresh) {
            setKey(prevKey => prevKey + 1);
        }
    }, [refresh]);

    return (
        <div className="min-h-screen">
            <Servers key={key} />
        </div>
    );
}
