import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

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

            <div className='flex flex-col flex-1 overflow-hidden'>
                <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}