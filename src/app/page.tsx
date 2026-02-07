'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user?.authenticated) {
                router.push('/dashboard');
            } else {
                router.push('/signin');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        </div>
    );
}
