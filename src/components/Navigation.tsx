'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
    children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
    const { user, signout, isLoading } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide navigation on sign in page
    const hideNav = pathname === '/signin' || pathname === '/';

    if (hideNav) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="relative h-10 w-32">
                                <Image
                                    src="https://logos.bowlersnetwork.com/office_logo.png"
                                    alt="The Office - Staff Portal"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6">
                            {!isLoading && user?.authenticated && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className={`text-sm font-medium transition-colors ${pathname === '/dashboard'
                                            ? 'text-[#22C55E]'
                                            : 'text-black hover:text-[#22C55E]'
                                            }`}
                                    >
                                        Dashboard
                                    </Link>

                                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                                        <div className="flex items-center gap-2">
                                            {user.profile_picture_url ? (
                                                <Image
                                                    src={user.profile_picture_url}
                                                    alt={user.name}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-black">
                                                {user.name || user.username}
                                            </span>
                                        </div>

                                        <button
                                            onClick={signout}
                                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-black" />
                            ) : (
                                <Menu className="w-6 h-6 text-black" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-4 space-y-3">
                            {!isLoading && user?.authenticated && (
                                <>
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
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
                                        <div>
                                            <p className="text-sm font-medium text-black">{user.name || user.username}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className="block py-2 text-sm font-medium text-black hover:text-[#22C55E]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            signout();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-64px)]">
                {children}
            </main>
        </div>
    );
}
