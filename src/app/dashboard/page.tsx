'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user?.authenticated) {
            router.push('/signin');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user?.authenticated) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black mb-2">
                        Welcome back, {user.first_name || user.name || 'Staff Member'}!
                    </h1>
                    <p className="text-gray-600">
                        Here&apos;s your staff portal dashboard.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-black h-24 relative">
                        <div className="absolute -bottom-12 left-8">
                            {user.profile_picture_url ? (
                                <Image
                                    src={user.profile_picture_url}
                                    alt={user.name}
                                    width={96}
                                    height={96}
                                    className="rounded-2xl border-4 border-white shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-16 pb-6 px-8">
                        <h2 className="text-2xl font-bold text-black mb-1">{user.name}</h2>
                        <p className="text-gray-500">@{user.username}</p>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.email && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                                        <Mail className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Email</p>
                                        <p className="text-sm text-black font-semibold">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            {user.roles && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                                        <Shield className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Roles</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.roles.is_center_admin && (
                                                <span className="text-xs px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full font-medium">
                                                    Center Admin
                                                </span>
                                            )}
                                            {user.roles.is_tournament_director && (
                                                <span className="text-xs px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full font-medium">
                                                    Tournament Director
                                                </span>
                                            )}
                                            {user.roles.is_pro && (
                                                <span className="text-xs px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full font-medium">
                                                    Pro
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {user.follow_info && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                                        <User className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Network</p>
                                        <p className="text-sm text-black font-semibold">
                                            {user.follow_info.follwers || 0} followers · {user.follow_info.followings || 0} following
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Level', value: user.level || 1, icon: '⭐' },
                        { label: 'XP', value: user.xp || 0, icon: '✨' },
                        { label: 'User ID', value: user.user_id || '-', icon: '🆔' },
                        { label: 'Status', value: 'Active', icon: '🟢' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <p className="text-2xl font-bold text-black">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
