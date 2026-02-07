'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} text-black animate-spin`} />
            {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
        </div>
    );
}

// Full page loading state
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

// Skeleton loader for cards
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

// Skeleton loader for tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
            <div className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                        <div className="w-20 h-8 bg-gray-200 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}
