'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, TableSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Toast, { useToast } from '@/components/Toast';
import { Layers, Tag } from 'lucide-react';
import axios from 'axios';
import { BrandType } from '@/types/office';

export default function BrandTypesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [brandTypes, setBrandTypes] = useState<BrandType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!authLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchBrandTypes();
        }
    }, [user]);

    const fetchBrandTypes = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/office/brand-types', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBrandTypes(response.data || []);
        } catch (error) {
            console.error('Error fetching brand types:', error);
            showToast('Failed to fetch brand types', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <PageLoader text="Loading..." />;
    }

    if (!user?.authenticated) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-xl">
                    <Layers className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-black">Brand Types</h1>
                    <p className="text-sm text-gray-600">Available brand categories</p>
                </div>
            </div>

            {/* Brand Types Grid */}
            {loading ? (
                <TableSkeleton rows={4} />
            ) : brandTypes.length === 0 ? (
                <EmptyState
                    title="No brand types"
                    description="No brand categories are available yet"
                    icon={<Layers className="w-8 h-8 text-gray-400" />}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {brandTypes.map((type) => (
                        <div
                            key={type.id}
                            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-50 rounded-xl flex-shrink-0">
                                    <Tag className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-black">{type.name}</h3>
                                    {type.description && (
                                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">ID: {type.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Toast */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}
