import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className='flex h-screen overflow-hidden bg-background'>
            <Suspense fallback>
                <Sidebar />
            </Suspense>
        </div>
    )
}