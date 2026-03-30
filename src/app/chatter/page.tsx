'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, TableSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { uploadFileToCloud } from '@/lib/cloudUploadService';
import { ChatterTopic } from '@/types/office';
import { MessageSquare, Plus, Edit2, Search, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ChatterPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [topics, setTopics] = useState<ChatterTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState<ChatterTopic | null>(null);

    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formBannerUrl, setFormBannerUrl] = useState('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!authLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchTopics();
        }
    }, [user]);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/office/chatter/topics', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const raw = response.data;
            const normalized: ChatterTopic[] = Array.isArray(raw)
                ? raw.map((item: any) => ({
                    topic_id: Number(item.topic_id),
                    name: item.name || '',
                    description: item.description || '',
                    banner_url: item.banner_url || '',
                    is_hidden: Boolean(item.is_hidden),
                }))
                : [];

            setTopics(normalized);
        } catch (error) {
            console.error('Error fetching chatter topics:', error);
            showToast('Failed to fetch topics', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingTopic(null);
        setFormName('');
        setFormDescription('');
        setFormBannerUrl('');
        setBannerFile(null);
        setUploadProgress(0);
        setUploadingBanner(false);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (topic: ChatterTopic) => {
        setEditingTopic(topic);
        setFormName(topic.name);
        setFormDescription(topic.description);
        setFormBannerUrl(topic.banner_url || '');
        setBannerFile(null);
        setUploadProgress(0);
        setShowModal(true);
    };

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'warning');
            return;
        }

        setBannerFile(file);
        setFormBannerUrl(URL.createObjectURL(file));
    };

    const uploadBannerIfNeeded = async (): Promise<string> => {
        if (!bannerFile) return formBannerUrl;

        setUploadingBanner(true);
        setUploadProgress(0);

        const result = await uploadFileToCloud(bannerFile, 'cdn', {
            onProgress: (progress) => setUploadProgress(progress),
            onError: (error) => showToast(`Upload error: ${error}`, 'error'),
        });

        setUploadingBanner(false);

        if (!result.success || !result.publicUrl) {
            throw new Error('Banner upload failed');
        }

        return result.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim() || !formDescription.trim() || (!formBannerUrl && !bannerFile)) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const finalBannerUrl = await uploadBannerIfNeeded();

            if (editingTopic) {
                await axios.patch(
                    '/api/office/chatter/topics',
                    {
                        topic_id: editingTopic.topic_id,
                        data: {
                            name: formName.trim(),
                            description: formDescription.trim(),
                            banner_url: finalBannerUrl,
                        },
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                showToast('Topic updated successfully', 'success');
            } else {
                await axios.post(
                    '/api/office/chatter/topics',
                    {
                        name: formName.trim(),
                        description: formDescription.trim(),
                        banner_url: finalBannerUrl,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                showToast('Topic created successfully', 'success');
            }

            setShowModal(false);
            resetForm();
            fetchTopics();
        } catch (error) {
            console.error('Error saving chatter topic:', error);
            showToast(editingTopic ? 'Failed to update topic' : 'Failed to create topic', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTopics = useMemo(
        () => topics.filter((topic) => (
            topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchQuery.toLowerCase())
        )),
        [topics, searchQuery]
    );

    if (authLoading) {
        return <PageLoader text="Loading..." />;
    }

    if (!user?.authenticated) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white">Chatter Topics</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage chatter topics</p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-gray-700 text-white text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Topic
                </button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <TableSkeleton rows={5} />
            ) : filteredTopics.length === 0 ? (
                <EmptyState
                    title={searchQuery ? 'No topics found' : 'No topics yet'}
                    description={searchQuery ? 'Try a different search term' : 'Create your first chatter topic to get started'}
                    action={!searchQuery ? { label: 'Add Topic', onClick: openCreateModal } : undefined}
                />
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Topic</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredTopics.map((topic) => (
                                    <tr key={topic.topic_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {topic.banner_url ? (
                                                    <img
                                                        src={topic.banner_url}
                                                        alt={topic.name}
                                                        className="w-14 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-black dark:text-white">{topic.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Details: {topic.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xl">{topic.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${topic.is_hidden
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                }`}>
                                                {topic.is_hidden ? 'Hidden' : 'Visible'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(topic)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredTopics.map((topic) => (
                            <div key={topic.topic_id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {topic.banner_url ? (
                                            <img
                                                src={topic.banner_url}
                                                alt={topic.name}
                                                className="w-14 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-14 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                <ImageIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-black dark:text-white truncate">{topic.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {topic.topic_id}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${topic.is_hidden
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        }`}>
                                        {topic.is_hidden ? 'Hidden' : 'Visible'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{topic.description}</p>
                                <div>
                                    <button
                                        onClick={() => openEditModal(topic)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingTopic ? 'Edit Topic' : 'Add Topic'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Topic Name</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Enter topic name"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            maxLength={120}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Description</label>
                        <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Enter topic description"
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none"
                            maxLength={500}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Banner URL</label>
                        <input
                            type="url"
                            value={bannerFile ? '' : formBannerUrl}
                            onChange={(e) => {
                                setBannerFile(null);
                                setFormBannerUrl(e.target.value);
                            }}
                            placeholder="https://example.com/banner.jpg"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            required={!bannerFile}
                        />
                        <p className="mt-2 text-xs text-gray-500">You can paste a URL or upload a banner image below.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Upload Banner</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileChange}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
                        />
                        {uploadingBanner && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading banner... {uploadProgress}%
                            </div>
                        )}
                    </div>

                    {formBannerUrl && (
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Banner Preview</label>
                            <div className="relative w-full aspect-video rounded-xl border border-gray-200 overflow-hidden bg-gray-50 dark:bg-gray-800">
                                <img
                                    src={formBannerUrl}
                                    alt="Banner preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploadingBanner}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingTopic ? 'Save Changes' : 'Create Topic'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}