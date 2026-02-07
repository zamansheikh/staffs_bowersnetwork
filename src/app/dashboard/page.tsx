'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/LoadingSpinner';
import { Users, Tag, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface DashboardStats {
    staffCount: number;
    brandsCount: number;
}

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        staffCount: 0,
        brandsCount: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    const isAdmin = user?.roles?.is_office_admin === true;

    useEffect(() => {
        if (!isLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [staffRes, brandsRes] = await Promise.allSettled([
                axios.get('/api/office/staff', { headers }),
                axios.get('/api/office/brands', { headers }),
            ]);

            setStats({
                staffCount: staffRes.status === 'fulfilled' ? (staffRes.value.data?.length || 0) : 0,
                brandsCount: brandsRes.status === 'fulfilled' ? (brandsRes.value.data?.length || 0) : 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (isLoading) {
        return <PageLoader text="Loading dashboard..." />;
    }

    if (!user?.authenticated) {
        return null;
    }

    const statCards = [
        {
            title: 'Team Members',
            count: stats.staffCount,
            icon: Users,
            href: '/team',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Brands',
            count: stats.brandsCount,
            icon: Tag,
            href: '/brands',
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">
                        Welcome back, {user.first_name || user.name?.split(' ')[0] || 'Team'}! 👋
                    </h1>
                    {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg">
                            <Shield className="w-3 h-3" />
                            Office Admin
                        </span>
                    )}
                </div>
                <p className="text-gray-600 mt-1">
                    Manage your team and brands from here.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-black">
                                    {loadingStats ? (
                                        <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
                                    ) : (
                                        card.title === 'Team Members' ? stats.staffCount : stats.brandsCount
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{card.title}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                    <h2 className="text-lg font-bold text-black">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/team"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <Users className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-black">Manage Team</span>
                    </Link>
                    <Link
                        href="/brands"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <Tag className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-black">Manage Brands</span>
                    </Link>
                </div>
            </div>

            {/* User Info Card */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-black mb-4">Your Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Name</p>
                        <p className="text-sm font-semibold text-black">{user.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Username</p>
                        <p className="text-sm font-semibold text-black">{user.username || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Role</p>
                        <p className="text-sm font-semibold text-black flex items-center gap-2">
                            {isAdmin ? (
                                <>
                                    <Shield className="w-4 h-4 text-purple-600" />
                                    Office Admin
                                </>
                            ) : (
                                'Office Staff'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
