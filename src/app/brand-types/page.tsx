'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, TableSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { Layers, Tag } from 'lucide-react';
import axios from 'axios';
import { BrandType } from '@/types/office';

export default function BrandTypesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [brandTypes, setBrandTypes] = useState<BrandType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [submitting, setSubmitting] = useState(false);
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

    const handleAddBrandType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTypeName) {
            showToast('Please enter a name', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(
                '/api/office/brands/types',
                { name: newTypeName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Brand type added', 'success');
            setShowAddModal(false);
            setNewTypeName('');
            fetchBrandTypes();
        } catch (err) {
            console.error('Error adding brand type:', err);
            showToast('Failed to add brand type', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const fetchBrandTypes = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/office/brands/types', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // normalize response (backend may use brand_type_id)
            const raw: any[] = response.data || [];
            const normalized: BrandType[] = raw.map((item) => ({
                id: item.id ?? item.brand_type_id,
                name: item.name,
                description: item.description,
            }));
            setBrandTypes(normalized);
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
                <button
                    onClick={() => setShowAddModal(true)}
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                    <Tag className="w-4 h-4" />
                    Add Type
                </button>
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

            {/* modal to add brand type */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Brand Type">
                <form onSubmit={handleAddBrandType} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-2"
                            placeholder="e.g. Balls"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50"
                        >
                            {submitting ? 'Adding…' : 'Add'}
                        </button>
                    </div>
                </form>
            </Modal>
            {/* Toast */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}
