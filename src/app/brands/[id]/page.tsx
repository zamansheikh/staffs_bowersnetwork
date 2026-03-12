'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/LoadingSpinner';
import Toast, { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import axios from 'axios';
import { Brand, BrandType } from '@/types/office';
import { uploadFileToCloud } from '@/lib/cloudUploadService';
import { Tag, Edit2, X } from 'lucide-react';

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [brandTypes, setBrandTypes] = useState<BrandType[]>([]);

    // form state
    const [formName, setFormName] = useState('');
    const [formFormalName, setFormFormalName] = useState('');
    const [formLogoUrl, setFormLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formBrandTypeId, setFormBrandTypeId] = useState<number | ''>('');
    const [submitting, setSubmitting] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!authLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchBrand();
            fetchBrandTypes();
        }
    }, [user]);

    const fetchBrand = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get(`/api/office/brands/${id}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBrand(res.data);
        } catch (err) {
            console.error('Failed to fetch brand details', err);
            showToast('Could not load brand', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchBrandTypes = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('/api/office/brands/types', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const raw: any[] = res.data || [];
            const normalized: BrandType[] = raw.map((t) => ({
                id: t.id ?? t.brand_type_id,
                name: t.name,
            }));
            setBrandTypes(normalized);
        } catch (err) {
            console.error('Failed to fetch brand types', err);
        }
    };

    const startEditing = () => {
        if (brand) {
            setFormName(brand.name);
            setFormFormalName(brand.formal_name || '');
            setFormLogoUrl(brand.logo_url || '');
            setLogoFile(null); // clear any previously chosen file
            setFormBrandTypeId(brand.brand_type_id || '');
            setShowModal(true);
        }
    };

    const cancelEditing = () => {
        setShowModal(false);
    };

    // helper to update preview when user selects a file
    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setFormLogoUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || !formFormalName || (!formLogoUrl && !logoFile) || !formBrandTypeId) {
            showToast('Please fill in all fields', 'warning');
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            if (logoFile) {
                setUploadingLogo(true);
                setUploadProgress(0);
                const result = await uploadFileToCloud(logoFile, 'cdn', {
                    onProgress: (p) => setUploadProgress(p),
                    onError: (err) => showToast(`Upload error: ${err}`, 'error'),
                });
                setUploadingLogo(false);
                if (result.success && result.publicUrl) {
                    setFormLogoUrl(result.publicUrl);
                } else {
                    throw new Error('Logo upload failed');
                }
            }

            const payload = {
                brand_type_id: formBrandTypeId,
                brand_data: {
                    name: formName,
                    formal_name: formFormalName,
                    logo_url: formLogoUrl,
                },
            };

            await axios.post(`/api/office/brands/${id}/edit`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast('Brand updated', 'success');
            setShowModal(false);
            fetchBrand();
        } catch (err) {
            console.error('Error saving brand', err);
            showToast('Failed to update brand', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <PageLoader text="Loading brand..." />;
    }

    if (!brand) {
        return <p className="p-4">Brand not found.</p>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-xl">
                    <Tag className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-black">{brand.name}</h1>
                    <p className="text-sm text-gray-600">{brand.formal_name}</p>
                </div>
                <button
                    onClick={startEditing}
                    disabled={showModal}
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit
                </button>
            </div>

            <div className="space-y-4 text-center flex flex-col items-center">
                <p><strong>Brand Type:</strong> {typeof brand.brand_type === 'string' ? brand.brand_type : brand.brand_type?.name}</p>
                <p><strong>Formal Name:</strong> {brand.formal_name}</p>
                {brand.logo_url && (
                    <div>
                        <strong>Logo:</strong>
                        <img src={brand.logo_url} alt="logo" className="mt-2 max-w-xs mx-auto" />
                    </div>
                )}
            </div>

            <Toast {...toast} onClose={hideToast} />
            <Modal
                isOpen={showModal}
                onClose={cancelEditing}
                title="Edit Brand"
            >
                <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Brand Type</label>
                        <select
                            value={formBrandTypeId}
                            onChange={(e) => setFormBrandTypeId(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                            required
                        >
                            <option value="">Select type…</option>
                            {brandTypes.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Name</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Formal Name</label>
                        <input
                            type="text"
                            value={formFormalName}
                            onChange={(e) => setFormFormalName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Brand Logo</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => { handleLogoFileChange(e); e.target.value = ''; }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="relative flex items-center justify-center flex-col gap-2 border-2 border-dashed border-gray-300 rounded-xl py-10 hover:bg-gray-50 transition-colors">
                                {!formLogoUrl ? (
                                    <p className="text-gray-500">Click or drag image here to upload</p>
                                ) : (
                                    <div className="absolute inset-0">
                                        <img
                                            src={formLogoUrl}
                                            alt="Logo preview"
                                            className="object-contain p-4 w-full h-full"
                                        />
                                    </div>
                                )}
                                {uploadingLogo && (
                                    <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={cancelEditing}
                            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Updating…' : 'Update Brand'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}