import { Suspense } from 'react';
import SearchParamsHandler from '@/components/dashboard/SearchParamsHandler';

export default function Dashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen">
                <SearchParamsHandler />
            </div>
        </Suspense>
    );
}
