'use client';

import { FileX, Plus } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {icon || <FileX className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
            <p className="text-sm text-gray-600 max-w-sm mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {action.label}
                </button>
            )}
        </div>
    );
}
