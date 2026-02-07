'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader, TableSkeleton } from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { Users, Plus, Trash2, Shield, Search, X, UserCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Staff, Email } from '@/types/office';

export default function TeamPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Staff | null>(null);
    const [showPromoteConfirm, setShowPromoteConfirm] = useState<Staff | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Add staff form - email search
    const [emails, setEmails] = useState<Email[]>([]);
    const [emailSearch, setEmailSearch] = useState('');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [newDesignation, setNewDesignation] = useState('');
    const [loadingEmails, setLoadingEmails] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    const isAdmin = user?.roles?.is_office_admin === true;

    useEffect(() => {
        if (!authLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchStaff();
        }
    }, [user]);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/office/staff', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStaff(response.data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            showToast('Failed to fetch team', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmails = async () => {
        setLoadingEmails(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('/api/office/emails', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmails(response.data || []);
        } catch (error) {
            console.error('Error fetching emails:', error);
            showToast('Failed to fetch users', 'error');
        } finally {
            setLoadingEmails(false);
        }
    };

    const openAddModal = () => {
        setSelectedEmail(null);
        setNewDesignation('');
        setEmailSearch('');
        setShowAddModal(true);
        fetchEmails();
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmail || !newDesignation) {
            showToast('Please select a user and enter designation', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('/api/office/staff',
                { email: selectedEmail.email, designation: newDesignation },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Team member added successfully', 'success');
            setShowAddModal(false);
            setSelectedEmail(null);
            setNewDesignation('');
            fetchStaff();
        } catch (error) {
            console.error('Error adding staff:', error);
            showToast('Failed to add team member', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStaff = async () => {
        if (!showDeleteConfirm) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete('/api/office/staff', {
                headers: { Authorization: `Bearer ${token}` },
                data: { staff_id: showDeleteConfirm.id },
            });
            showToast('Team member removed successfully', 'success');
            setShowDeleteConfirm(null);
            fetchStaff();
        } catch (error) {
            console.error('Error deleting staff:', error);
            showToast('Failed to remove team member', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePromoteToAdmin = async () => {
        if (!showPromoteConfirm) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('/api/office/staff/make-admin',
                { staff_id: showPromoteConfirm.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Team member promoted to admin', 'success');
            setShowPromoteConfirm(null);
            fetchStaff();
        } catch (error) {
            console.error('Error promoting staff:', error);
            showToast('Failed to promote team member', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStaff = staff.filter((s) =>
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredEmails = emails.filter((e) =>
        !e.is_staff && (
            e.email?.toLowerCase().includes(emailSearch.toLowerCase()) ||
            e.name?.toLowerCase().includes(emailSearch.toLowerCase()) ||
            e.username?.toLowerCase().includes(emailSearch.toLowerCase())
        )
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
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black">Team</h1>
                        <p className="text-sm text-gray-600">Manage your office team members</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search team..."
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

            {/* Staff List */}
            {loading ? (
                <TableSkeleton rows={5} />
            ) : filteredStaff.length === 0 ? (
                <EmptyState
                    title={searchQuery ? 'No members found' : 'No team members yet'}
                    description={searchQuery ? 'Try a different search term' : 'Add your first team member to get started'}
                    action={!searchQuery ? { label: 'Add Member', onClick: openAddModal } : undefined}
                />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Designation
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStaff.map((member, index) => (
                                    <tr key={member.id || member.email || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-black">
                                                    {member.name || member.username || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700">{member.designation || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.is_admin ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                    Staff
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Only show promote button to admins and for non-admin staff */}
                                                {isAdmin && !member.is_admin && (
                                                    <button
                                                        onClick={() => setShowPromoteConfirm(member)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowDeleteConfirm(member)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {filteredStaff.map((member, index) => (
                            <div key={member.id || member.email || index} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-black">
                                            {member.name || member.username || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                        <p className="text-sm text-gray-600 mt-1">{member.designation || 'N/A'}</p>
                                        <div className="mt-2">
                                            {member.is_admin ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                    Staff
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isAdmin && !member.is_admin && (
                                            <button
                                                onClick={() => setShowPromoteConfirm(member)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowDeleteConfirm(member)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Team Member" size="lg">
                <form onSubmit={handleAddStaff} className="space-y-4">
                    {/* User Search */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Select User</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={emailSearch}
                                onChange={(e) => setEmailSearch(e.target.value)}
                                placeholder="Search users by name or email..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            />
                        </div>

                        {/* User List */}
                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                            {loadingEmails ? (
                                <div className="p-4 text-center">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                                </div>
                            ) : filteredEmails.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    {emailSearch ? 'No users found' : 'All users are already staff members'}
                                </div>
                            ) : (
                                filteredEmails.map((email) => (
                                    <button
                                        key={email.email}
                                        type="button"
                                        onClick={() => setSelectedEmail(email)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedEmail?.email === email.email ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium text-black">{email.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{email.email}</p>
                                        </div>
                                        {selectedEmail?.email === email.email && (
                                            <UserCheck className="w-4 h-4 text-green-500" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Selected User Display */}
                    {selectedEmail && (
                        <div className="p-3 bg-green-50 rounded-xl flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-800">{selectedEmail.name}</p>
                                <p className="text-xs text-green-600">{selectedEmail.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Designation */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Designation</label>
                        <input
                            type="text"
                            value={newDesignation}
                            onChange={(e) => setNewDesignation(e.target.value)}
                            placeholder="e.g. Manager, Developer"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-black text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedEmail}
                            className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                title="Remove Team Member"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to remove <strong>{showDeleteConfirm?.email}</strong> from the team?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-black text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteStaff}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Removing...' : 'Remove'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Promote Confirmation Modal */}
            <Modal
                isOpen={!!showPromoteConfirm}
                onClose={() => setShowPromoteConfirm(null)}
                title="Promote to Admin"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Promote <strong>{showPromoteConfirm?.email}</strong> to Office Admin? They will be able to manage the team.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowPromoteConfirm(null)}
                            className="flex-1 px-4 py-3 border border-gray-200 text-black text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePromoteToAdmin}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Promoting...' : 'Promote'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
}
