'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, CardSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { Tag, Plus, Edit2, Search, X, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import { Brand, BrandType } from '@/types/office';

export default function BrandsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandTypes, setBrandTypes] = useState<BrandType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formFormalName, setFormFormalName] = useState('');
    const [formLogoUrl, setFormLogoUrl] = useState('');
    const [formBrandTypeId, setFormBrandTypeId] = useState<number | ''>('');

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!authLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const [brandsRes, typesRes] = await Promise.all([
                axios.get('/api/office/brands', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/office/brand-types', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setBrands(brandsRes.data || []);
            setBrandTypes(typesRes.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
            showToast('Failed to fetch brands', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingBrand(null);
        setFormName('');
        setFormFormalName('');
        setFormLogoUrl('');
        setFormBrandTypeId(brandTypes[0]?.id || '');
        setShowModal(true);
    };

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setFormName(brand.name);
        setFormFormalName(brand.formal_name);
        setFormLogoUrl(brand.logo_url);
        setFormBrandTypeId(brand.brand_type_id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || !formFormalName || !formLogoUrl || !formBrandTypeId) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const payload = {
                brand_type_id: formBrandTypeId,
                brand_data: {
                    name: formName,
                    formal_name: formFormalName,
                    logo_url: formLogoUrl,
                },
            };

            if (editingBrand) {
                await axios.post(`/api/office/brands/${editingBrand.id}/edit`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToast('Brand updated successfully', 'success');
            } else {
                await axios.post('/api/office/brands', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToast('Brand created successfully', 'success');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving brand:', error);
            showToast(editingBrand ? 'Failed to update brand' : 'Failed to create brand', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBrands = brands.filter((b) => {
        const matchesSearch =
            b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.formal_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedTypeFilter === null || b.brand_type_id === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

    const getBrandTypeName = (typeId: number) => {
        return brandTypes.find((t) => t.id === typeId)?.name || 'Unknown';
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-xl">
                        <Tag className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black">Brands</h1>
                        <p className="text-sm text-gray-600">Manage your brand catalog</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Brand
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search brands..."
                        className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>
                <select
                    value={selectedTypeFilter ?? ''}
                    onChange={(e) => setSelectedTypeFilter(e.target.value ? Number(e.target.value) : null)}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                >
                    <option value="">All Types</option>
                    {brandTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>

            {/* Brands Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredBrands.length === 0 ? (
                <EmptyState
                    title={searchQuery || selectedTypeFilter ? 'No brands found' : 'No brands yet'}
                    description={searchQuery || selectedTypeFilter ? 'Try different filters' : 'Add your first brand to get started'}
                    action={!(searchQuery || selectedTypeFilter) ? { label: 'Add Brand', onClick: openAddModal } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredBrands.map((brand) => (
                        <div
                            key={brand.id}
                            className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all group"
                        >
                            <div className="relative w-full h-24 mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                                {brand.logo_url ? (
                                    <Image
                                        src={brand.logo_url}
                                        alt={brand.name}
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                ) : (
                                    <Tag className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <div className="mb-3">
                                <h3 className="text-sm font-bold text-black truncate">{brand.name}</h3>
                                <p className="text-xs text-gray-500 truncate">{brand.formal_name}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">
                                    {getBrandTypeName(brand.brand_type_id)}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(brand)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Edit Brand"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    {brand.logo_url && (
                                        <a
                                            href={brand.logo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="View Logo"
                                        >
                                            <ExternalLink className="w-4 h-4 text-gray-600" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingBrand ? 'Edit Brand' : 'Add Brand'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Brand Type</label>
                        <select
                            value={formBrandTypeId}
                            onChange={(e) => setFormBrandTypeId(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            required
                        >
                            <option value="">Select type...</option>
                            {brandTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Name</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. Nike"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Formal Name</label>
                        <input
                            type="text"
                            value={formFormalName}
                            onChange={(e) => setFormFormalName(e.target.value)}
                            placeholder="e.g. Nike Inc."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Logo URL</label>
                        <input
                            type="url"
                            value={formLogoUrl}
                            onChange={(e) => setFormLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            required
                        />
                    </div>
                    {formLogoUrl && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-2">Preview:</p>
                            <div className="relative h-16 w-full">
                                <Image
                                    src={formLogoUrl}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                    onError={() => { }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-black text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Add Brand'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Toast */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}
