'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
    Shield,
    UserCheck,
    Sun,
    Moon,
} from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: UserCheck },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/brands', label: 'Brands', icon: Tag },
];

export default function Navigation({ children }: NavigationProps) {
    const { user, signout, isLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const hideNav = pathname === '/signin' || pathname === '/';
    if (hideNav) return <>{children}</>;

    const isAdmin = user?.roles?.is_office_admin === true;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between px-4 h-16">
                    <Link href="/dashboard" className="flex items-center">
                        <div className="relative h-10 w-32">
                            <Image
                                src="https://logos.bowlersnetwork.com/office_logo.png"
                                alt="The Office"
                                fill
                                className="object-contain invert dark:invert-0"
                                unoptimized
                            />
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {sidebarOpen
                                ? <X className="w-6 h-6 text-black dark:text-white" />
                                : <Menu className="w-6 h-6 text-black dark:text-white" />
                            }
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:shadow-none lg:z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
                            <div className="relative h-10 w-36">
                                <Image
                                    src="https://logos.bowlersnetwork.com/office_logo.png"
                                    alt="The Office"
                                    fill
                                    className="object-contain invert dark:invert-0"
                                    unoptimized
                                />
                            </div>
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="hidden lg:flex p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-all"
                            aria-label="Toggle theme"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark'
                                ? <Sun className="w-4 h-4" />
                                : <Moon className="w-4 h-4" />
                            }
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                                        isActive
                                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                                            : 'bg-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white dark:text-black' : 'text-black dark:text-white group-hover:text-black dark:group-hover:text-white'}`} />
                                    <span className={`${isActive ? 'text-white dark:text-black' : 'text-black dark:text-white group-hover:text-black dark:group-hover:text-white'}`}>{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white dark:text-black" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    {!isLoading && user?.authenticated && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                                {user.profile_picture_url ? (
                                    <Image
                                        src={user.profile_picture_url}
                                        alt={user.name}
                                        width={36}
                                        height={36}
                                        className="rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                                    />
                                ) : (
                                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-black dark:text-white truncate flex items-center gap-1.5">
                                        {user.name || user.username}
                                        {isAdmin && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                                                <Shield className="w-2.5 h-2.5" />Admin
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSidebarOpen(false); signout(); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-black dark:bg-gray-700 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
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
