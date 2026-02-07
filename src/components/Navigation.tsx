'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    LogOut,
    User,
    Menu,
    X,
    LayoutDashboard,
    Users,
    Tag,
    ChevronRight,
    Shield
} from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/brands', label: 'Brands', icon: Tag },
];

export default function Navigation({ children }: NavigationProps) {
    const { user, signout, isLoading } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Hide navigation on sign in page
    const hideNav = pathname === '/signin' || pathname === '/';

    if (hideNav) {
        return <>{children}</>;
    }

    const isAdmin = user?.roles?.is_office_admin === true;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 h-16">
                    <Link href="/dashboard" className="flex items-center">
                        <div className="relative h-10 w-32">
                            <Image
                                src="https://logos.bowlersnetwork.com/office_logo.png"
                                alt="The Office"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6 text-black" />
                        ) : (
                            <Menu className="w-6 h-6 text-black" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-lg
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:shadow-none lg:z-30
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                        <Link href="/dashboard" className="flex items-center" onClick={() => setSidebarOpen(false)}>
                            <div className="relative h-10 w-36">
                                <Image
                                    src="https://logos.bowlersnetwork.com/office_logo.png"
                                    alt="The Office"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-black text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    {!isLoading && user?.authenticated && (
                        <div className="border-t border-gray-200 p-4 space-y-3">
                            <div className="flex items-center gap-3 px-3">
                                {user.profile_picture_url ? (
                                    <Image
                                        src={user.profile_picture_url}
                                        alt={user.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-black truncate flex items-center gap-2">
                                        {user.name || user.username}
                                        {isAdmin && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                                <Shield className="w-3 h-3" />
                                                Admin
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    signout();
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
