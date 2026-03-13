'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, CardSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { Tag, Plus, Edit2, Search, X, ExternalLink, Layers } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { Brand, BrandType } from '@/types/office';
import { uploadFileToCloud } from '@/lib/cloudUploadService';

type TabType = 'brands' | 'types';

export default function BrandsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('brands');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandTypes, setBrandTypes] = useState<BrandType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [submitting, setSubmitting] = useState(false);
    // brand type addition
    const [showAddTypeModal, setShowAddTypeModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [typeSubmitting, setTypeSubmitting] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formFormalName, setFormFormalName] = useState('');
    const [formLogoUrl, setFormLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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
                axios.get('/api/office/brands/types', { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            // normalize types response
            const typesData = typesRes.data;
            const parsedTypes: BrandType[] = Array.isArray(typesData)
                ? typesData.map((t: any) => ({ id: t.brand_type_id, name: t.name }))
                : [];
            setBrandTypes(parsedTypes);

            // normalize brands response (object keyed by type)
            const rawBrands = brandsRes.data;
            let flat: Brand[] = [];
            if (rawBrands && typeof rawBrands === 'object' && !Array.isArray(rawBrands)) {
                Object.values(rawBrands).forEach((arr: any) => {
                    if (Array.isArray(arr)) {
                        flat = flat.concat(
                            arr.map((b: any) => {
                                // API returns fields like brand_type, brand_type_id
                                const type = parsedTypes.find(
                                    (pt) => pt.id === b.brand_type_id || pt.name === b.brand_type
                                );
                                return {
                                    id: b.brand_id,
                                    brand_type_id: b.brand_type_id,
                                    brand_type: type,
                                    name: b.name,
                                    formal_name: b.formal_name,
                                    logo_url: b.logo_url,
                                } as Brand;
                            })
                        );
                    }
                });
            }
            setBrands(flat);
        } catch (error) {
            console.error('Error fetching brands:', error);
            showToast('Failed to fetch brands', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBrandType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTypeName) {
            showToast('Please enter a type name', 'warning');
            return;
        }
        setTypeSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('/api/office/brands/types', { name: newTypeName }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Brand type added', 'success');
            setShowAddTypeModal(false);
            setNewTypeName('');
            fetchData();
        } catch (err) {
            console.error('Error adding brand type:', err);
            showToast('Failed to add brand type', 'error');
        } finally {
            setTypeSubmitting(false);
        }
    };

    const openAddModal = () => {
        setEditingBrand(null);
        setFormName('');
        setFormFormalName('');
        setFormLogoUrl('');
        setLogoFile(null);
        setFormBrandTypeId(brandTypes[0]?.id || '');
        setShowModal(true);
    };

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setFormName(brand.name);
        setFormFormalName(brand.formal_name);
        setFormLogoUrl(brand.logo_url);
        setLogoFile(null);
        setFormBrandTypeId(brand.brand_type_id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || !formFormalName || (!formLogoUrl && !logoFile) || !formBrandTypeId) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            let finalLogoUrl = formLogoUrl;

            // if there is a file selected, upload first
            if (logoFile) {
                setUploadingLogo(true);
                setUploadProgress(0);
                const result = await uploadFileToCloud(logoFile, 'cdn', {
                    onProgress: (p) => setUploadProgress(p),
                    onError: (err) => showToast(`Upload error: ${err}`, 'error'),
                });
                setUploadingLogo(false);
                if (result.success && result.publicUrl) {
                    finalLogoUrl = result.publicUrl;
                    setFormLogoUrl(result.publicUrl);
                } else {
                    throw new Error('Logo upload failed');
                }
            }

            if (editingBrand) {
                const editPayload = {
                    brand_type_id: formBrandTypeId,
                    brand_data: {
                        name: formName,
                        formal_name: formFormalName,
                    },
                };

                // Update basic info
                await axios.post(`/api/office/brands/${editingBrand.id}/edit`, editPayload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Update logo if a new one was uploaded
                if (logoFile && finalLogoUrl) {
                    await axios.post(`/api/office/brands/${editingBrand.id}/change-logo`, {
                        logo_url: finalLogoUrl
                    }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }
                showToast('Brand updated successfully', 'success');
            } else {
                const createPayload = {
                    brand_type_id: formBrandTypeId,
                    brand_data: {
                        name: formName,
                        formal_name: formFormalName,
                        logo_url: finalLogoUrl,
                    },
                };
                await axios.post('/api/office/brands', createPayload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToast('Brand created successfully', 'success');
            }
            setShowModal(false);
            setLogoFile(null);
            fetchData();
        } catch (error) {
            console.error('Error saving brand:', error);
            showToast(editingBrand ? 'Failed to update brand' : 'Failed to create brand', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBrands = (Array.isArray(brands) ? brands : []).filter((b) => {
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

    // upload helper
    // changed: just store file, upload on submit
    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setFormLogoUrl(URL.createObjectURL(file));
        }
    };

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
                {activeTab === 'brands' && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Brand
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('brands')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'brands'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-black'
                        }`}
                >
                    <Tag className="w-4 h-4 inline-block mr-2" />
                    Brands
                </button>
                <button
                    onClick={() => setActiveTab('types')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'types'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-black'
                        }`}
                >
                    <Layers className="w-4 h-4 inline-block mr-2" />
                    Brand Types
                </button>
            </div>

            {/* Brands Tab */}
            {activeTab === 'brands' && (
                <>
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
                            {(Array.isArray(brandTypes) ? brandTypes : []).map((type, index) => (
                                <option key={type.id || type.name || index} value={type.id ?? ''}>{type.name}</option>
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
                            {filteredBrands.map((brand, index) => (
                                <Link
                                    key={brand.id || brand.name || index}
                                    href={`/brands/${brand.id}`}
                                    className="block cursor-pointer bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all group"
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openEditModal(brand);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit Brand"
                                            >
                                                <Edit2 className="w-4 h-4 text-gray-600" />
                                            </button>
                                            {brand.logo_url && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        window.open(brand.logo_url, '_blank', 'noopener');
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Logo"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Brand Types Tab */}
            {activeTab === 'types' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowAddTypeModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            <Tag className="w-4 h-4" />
                            Add Type
                        </button>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : brandTypes.length === 0 ? (
                        <EmptyState
                            title="No brand types"
                            description="No brand categories are available yet"
                            icon={<Layers className="w-8 h-8 text-gray-400" />}
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {(Array.isArray(brandTypes) ? brandTypes : []).map((type, index) => (
                                <div
                                    key={type.id || type.name || index}
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
                                            <p className="text-xs text-gray-400 mt-2">
                                                {(Array.isArray(brands) ? brands : []).filter(b => b.brand_type_id === type.id).length} brands
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Brand Modal */}
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
                            {(Array.isArray(brandTypes) ? brandTypes : []).map((type, index) => (
                                <option key={type.id || type.name || index} value={type.id ?? ''}>{type.name}</option>
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
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">Brand Logo</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => { handleLogoFileChange(e); e.target.value = ''; }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="relative flex items-center justify-center flex-col gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl py-10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                {!formLogoUrl ? (
                                    <p className="text-gray-500 dark:text-gray-400">Click or drag image here to upload</p>
                                ) : (
                                    <div className="absolute inset-0">
                                        <Image
                                            src={formLogoUrl}
                                            alt="Logo preview"
                                            fill
                                            className="object-contain p-4"
                                            unoptimized
                                            onError={() => { }}
                                        />
                                    </div>
                                )}
                                {uploadingLogo && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploading: {uploadProgress}%</p>
                                )}
                            </div>
                        </div>
                    </div>

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
                            disabled={submitting || uploadingLogo}
                            className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Add Brand'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Brand Type Modal */}
            <Modal
                isOpen={showAddTypeModal}
                onClose={() => setShowAddTypeModal(false)}
                title="Add Brand Type"
            >
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
                            onClick={() => setShowAddTypeModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={typeSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50"
                        >
                            {typeSubmitting ? 'Adding…' : 'Add'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Toast */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}
