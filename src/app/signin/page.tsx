'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, Loader2, ArrowRight, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { signin, user, isLoading } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (user?.authenticated) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        try {
            const result = await signin(username, password);
            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Invalid credentials. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden relative">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl"></div>
            </div>

            {/* LEFT SIDE: Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 xl:px-24 py-12 z-10 relative">
                <div className="max-w-md w-full mx-auto">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 animate-in flex justify-center">
                        <div className="w-16 h-16 relative bg-white rounded-2xl p-2 shadow-md border border-gray-200">
                            <Image
                                src="https://logos.bowlersnetwork.com/office_logo.png"
                                alt="BowlersNetwork Staff"
                                fill
                                className="object-contain p-1"
                                unoptimized
                            />
                        </div>
                    </div>

                    <div className="mb-10 animate-in">
                        <div className="inline-block px-4 py-2 bg-gray-100 rounded-full mb-4">
                            <span className="text-sm font-bold text-black">👋 Staff Portal</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-black tracking-tight mb-3">
                            Welcome back
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Sign in to access the staff management portal.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-in" style={{ animationDelay: '200ms' }}>
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 shake">
                                <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="text-sm text-red-600 font-semibold">Authentication Failed</p>
                                    <p className="text-sm text-red-600/80 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Username Input */}
                            <div className="group">
                                <label htmlFor="username" className="block text-sm font-bold text-black mb-2.5">
                                    Username or Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-20">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                                            <User className="h-5 w-5 text-black" />
                                        </div>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-20 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] transition-all duration-300 hover:border-gray-300 shadow-sm"
                                        placeholder="Enter your username or email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2.5">
                                    <label htmlFor="password" className="block text-sm font-bold text-black">
                                        Password
                                    </label>
                                    <a
                                        href="https://auth.bowlersnetwork.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-[#22C55E] hover:opacity-80 transition-all"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-20">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                                            <Lock className="h-5 w-5 text-black" />
                                        </div>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-20 pr-14 py-4 bg-white border-2 border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] transition-all duration-300 hover:border-gray-300 shadow-sm"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-5 w-5 rounded-lg border-2 border-gray-300 text-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/30 focus:ring-offset-0 cursor-pointer transition-all accent-[#22C55E]"
                                />
                                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-black cursor-pointer">
                                    Keep me signed in
                                </label>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
                                Secure
                            </div>
                        </div>

                        {/* Black Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center items-center py-5 px-6 border-none rounded-2xl shadow-lg text-base font-bold text-white bg-black hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">Sign In to Portal</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE: Visual Section (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                            backgroundSize: '50px 50px'
                        }}>
                    </div>
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-[#22C55E]/10 blur-3xl"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo - Centered */}
                    <div className="flex justify-center animate-in">
                        <div className="w-20 h-20 relative bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/20">
                            <Image
                                src="https://logos.bowlersnetwork.com/office_logo.png"
                                alt="BowlersNetwork Staff"
                                fill
                                className="object-contain p-2"
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mb-16 space-y-8 animate-in" style={{ animationDelay: '300ms' }}>
                        <blockquote className="text-4xl xl:text-5xl font-extrabold leading-tight text-white">
                            &quot;Manage operations with <span className="text-[#22C55E]">efficiency</span> and precision.&quot;
                        </blockquote>

                        <p className="text-xl text-white/80 leading-relaxed max-w-md font-medium">
                            Access staff tools, manage events, and oversee bowling center operations.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-3 pt-4">
                            {[
                                { icon: '📊', text: 'Analytics' },
                                { icon: '🎳', text: 'Events' },
                                { icon: '👥', text: 'Users' },
                                { icon: '⚙️', text: 'Settings' }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-default"
                                >
                                    <span className="text-xl">{feature.icon}</span>
                                    <span className="text-sm font-semibold text-white">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center animate-in" style={{ animationDelay: '900ms' }}>
                        <div className="flex items-center gap-3 text-sm text-white/60 font-medium">
                            <span>© 2026 BowlersNetwork</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
