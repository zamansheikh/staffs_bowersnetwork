'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <AuthProvider>
            <Navigation>
                {children}
            </Navigation>
        </AuthProvider>
    );
}
