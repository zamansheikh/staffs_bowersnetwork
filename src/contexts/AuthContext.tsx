'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export interface User {
    id?: number;
    user_id?: number;
    email?: string;
    username?: string;
    name: string;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
    cover_photo_url?: string;
    xp?: number;
    level?: number;
    authenticated: boolean;
    access_token?: string;
    roles?: {
        is_pro: boolean;
        is_center_admin: boolean;
        is_tournament_director: boolean;
        is_office_admin?: boolean;
        is_office_staff?: boolean;
    };
    contact_info?: {
        email: string;
        is_public: boolean;
        is_added: boolean;
    };
    bio?: {
        content: string;
        is_public: boolean;
        is_added: boolean;
    };
    profile_media?: {
        profile_picture_url: string;
        cover_picture_url: string;
        intro_video_url: string;
    };
    follow_info?: {
        follwers: number;
        followings: number;
    };
}

interface SigninResult {
    success: boolean;
    error?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signin: (username: string, password: string) => Promise<SigninResult>;
    signout: () => void;
    refreshUserFromToken: (token?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const hydrateUserFromToken = async (incomingToken?: string, manageLoading = true): Promise<boolean> => {
        try {
            if (manageLoading) setIsLoading(true);

            const token = incomingToken || localStorage.getItem('access_token');
            if (!token) {
                localStorage.removeItem('user');
                document.cookie = 'access_token=; path=/; max-age=0'; // Clear cookie
                setUser(null);
                return false;
            }

            localStorage.setItem('access_token', token);
            // Set cookie so middleware can read it
            document.cookie = `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days

            try {
                const profileResponse = await axios.get('https://test.bowlersnetwork.com/api/profile/data', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                const data = profileResponse.data;
                const userData: User = {
                    id: data.user_id,
                    user_id: data.user_id,
                    email: data.contact_info?.email,
                    username: data.username,
                    name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    first_name: data.first_name,
                    last_name: data.last_name,
                    profile_picture_url: data.profile_media?.profile_picture_url,
                    cover_photo_url: data.profile_media?.cover_picture_url,
                    xp: data.xp,
                    level: data.level,
                    roles: data.roles,
                    contact_info: data.contact_info,
                    bio: data.bio,
                    profile_media: data.profile_media,
                    follow_info: data.follow_info,
                    authenticated: true,
                    access_token: token
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
            } catch (profileError) {
                console.error('Error fetching user profile:', profileError);

                // Fallback minimal user if profile fails
                const fallbackUser: User = {
                    username: 'staff_user',
                    name: 'Staff User',
                    authenticated: true,
                    access_token: token,
                };
                setUser(fallbackUser);
                localStorage.setItem('user', JSON.stringify(fallbackUser));
                return true;
            }
        } catch (error) {
            console.error('Error hydrating user from token:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setUser(null);
            return false;
        } finally {
            if (manageLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        hydrateUserFromToken(undefined, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signin = async (username: string, password: string): Promise<SigninResult> => {
        try {
            setIsLoading(true);

            const response = await axios.post('/api/auth/login/staff', {
                username: username,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                validateStatus: (status) => status >= 200 && status < 500
            });

            // Handle 200 - Success
            if (response.status === 200) {
                console.log('Login response:', response.data);
                if (response.data && response.data.access_token) {
                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);
                    const hydrated = await hydrateUserFromToken(access_token, false);
                    return { success: hydrated };
                }
                return { success: false, error: 'No access token received' };
            }

            // Handle 401 - Authentication error
            if (response.status === 401) {
                try {
                    const errorData = response.data;
                    if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
                        const errorMessage = errorData.errors[0] || 'Authentication failed';
                        return { success: false, error: errorMessage };
                    }
                } catch {
                    // If parsing fails, fall through to generic error
                }
                return { success: false, error: 'Invalid credentials. Please try again.' };
            }

            // Handle other status codes
            return { success: false, error: 'Something went wrong. Please try again.' };
        } catch (error) {
            console.error('Sign in error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Request error:', error.message);
            }
            return { success: false, error: 'Something went wrong. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const signout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        document.cookie = 'access_token=; path=/; max-age=0'; // Clear cookie
        setUser(null);
        router.push('/signin');
    };

    const value: AuthContextType = {
        user,
        isLoading,
        signin,
        signout,
        refreshUserFromToken: (token?: string) => hydrateUserFromToken(token, true),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
