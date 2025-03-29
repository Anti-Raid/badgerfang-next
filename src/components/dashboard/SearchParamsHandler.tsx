'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Servers from '@/components/dashboard/all-servers';

export default function SearchParamsHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const refresh = searchParams.get('refresh') === 'true';
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (refresh) {
            setKey(prevKey => prevKey + 1);

            // Remove 'refresh' query parameter after refreshing
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('refresh');

            router.replace(`/dashboard?${newParams.toString()}`, { scroll: false });
        }
    }, [refresh, searchParams, router]);

    return <Servers key={key} />;
}
