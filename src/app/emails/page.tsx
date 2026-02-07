'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, TableSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Toast, { useToast } from '@/components/Toast';
import { Mail, Search, X, UserCheck, User } from 'lucide-react';
import axios from 'axios';
import { Email } from '@/types/office';

export default function EmailsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!authLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchEmails();
        }
    }, [user]);

    const fetchEmails = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/office/emails', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmails(response.data || []);
        } catch (error) {
            console.error('Error fetching emails:', error);
            showToast('Failed to fetch emails', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredEmails = emails.filter((e) =>
        e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="p-2 bg-green-50 rounded-xl">
                        <Mail className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black">User Emails</h1>
                        <p className="text-sm text-gray-600">View all registered user emails</p>
                    </div>
                </div>
                <div className="text-sm text-gray-600">
                    {filteredEmails.length} {filteredEmails.length === 1 ? 'user' : 'users'}
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, username, or email..."
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
            </div>

            {/* Emails List */}
            {loading ? (
                <TableSkeleton rows={8} />
            ) : filteredEmails.length === 0 ? (
                <EmptyState
                    title={searchQuery ? 'No emails found' : 'No emails yet'}
                    description={searchQuery ? 'Try a different search term' : 'No user emails available'}
                />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEmails.map((email, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-black flex items-center gap-2">
                                                        {email.name || 'N/A'}
                                                        {email.is_me && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                                You
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">@{email.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`mailto:${email.email}`}
                                                className="text-sm text-[#22C55E] hover:underline"
                                            >
                                                {email.email}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            {email.is_staff ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    <UserCheck className="w-3 h-3" />
                                                    Staff
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {filteredEmails.map((email, index) => (
                            <div key={index} className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-black flex items-center gap-2 flex-wrap">
                                            {email.name || 'N/A'}
                                            {email.is_me && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">@{email.username}</p>
                                        <a
                                            href={`mailto:${email.email}`}
                                            className="text-sm text-[#22C55E] hover:underline block mt-1 truncate"
                                        >
                                            {email.email}
                                        </a>
                                        <div className="mt-2">
                                            {email.is_staff ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    <UserCheck className="w-3 h-3" />
                                                    Staff
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                    User
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toast */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}
