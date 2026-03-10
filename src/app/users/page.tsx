'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/LoadingSpinner';
import { Users, Trophy, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface UserData {
    user_count: number;
    pro_user_count: number;
}

interface SignupEntry {
    id: number;
    date_joined: string;
}

interface ChartPoint {
    label: string;
    value: number;
    fullLabel: string;
}

// ── Compact SVG line chart ────────────────────────────────────────────────────
function SignupLineChart({ data }: { data: ChartPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
                No signup data available
            </div>
        );
    }

    const W = 780;
    const H = 240;
    const padL = 48;
    const padR = 24;
    const padT = 16;
    const padB = 52;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const ySteps = 4;

    const getX = (i: number) =>
        data.length === 1 ? padL + cW / 2 : padL + (i / (data.length - 1)) * cW;
    const getY = (v: number) => padT + cH - (v / maxVal) * cH;

    const linePath = data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.value).toFixed(1)}`)
        .join(' ');

    const areaPath = [
        linePath,
        `L ${getX(data.length - 1).toFixed(1)} ${(padT + cH).toFixed(1)}`,
        `L ${getX(0).toFixed(1)} ${(padT + cH).toFixed(1)}`,
        'Z',
    ].join(' ');

    const gradientId = 'signupGrad';

    // Decide which x-labels to show (avoid crowding)
    const step = Math.ceil(data.length / 10);

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            aria-label="Monthly signups chart"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {Array.from({ length: ySteps + 1 }, (_, i) => {
                const v = (maxVal * i) / ySteps;
                const y = getY(v);
                return (
                    <g key={i}>
                        <line
                            x1={padL} y1={y.toFixed(1)}
                            x2={padL + cW} y2={y.toFixed(1)}
                            stroke="currentColor"
                            strokeOpacity="0.08"
                            strokeDasharray="4 4"
                        />
                        <text
                            x={(padL - 6).toFixed(1)}
                            y={(y + 4).toFixed(1)}
                            textAnchor="end"
                            fontSize="11"
                            fill="currentColor"
                            fillOpacity="0.5"
                        >
                            {Math.round(v)}
                        </text>
                    </g>
                );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Line */}
            <path
                d={linePath}
                fill="none"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dots */}
            {data.map((d, i) => (
                <g key={i}>
                    <circle
                        cx={getX(i).toFixed(1)}
                        cy={getY(d.value).toFixed(1)}
                        r="5"
                        fill="#22C55E"
                        stroke="white"
                        strokeWidth="2"
                    />
                    {/* Invisible larger hit area with tooltip */}
                    <title>{`${d.fullLabel}: ${d.value} signups`}</title>
                    <circle
                        cx={getX(i).toFixed(1)}
                        cy={getY(d.value).toFixed(1)}
                        r="10"
                        fill="transparent"
                    />
                </g>
            ))}

            {/* X-axis labels */}
            {data.map((d, i) => {
                if (i % step !== 0 && i !== data.length - 1) return null;
                const x = getX(i);
                const y = padT + cH + 18;
                return (
                    <text
                        key={i}
                        x={x.toFixed(1)}
                        y={y.toFixed(1)}
                        textAnchor="middle"
                        fontSize="11"
                        fill="currentColor"
                        fillOpacity="0.55"
                    >
                        {d.label}
                    </text>
                );
            })}
        </svg>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: number | null;
    icon: React.ElementType;
    color: string;
    bg: string;
    loading: boolean;
    subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, bg, loading, subtitle }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
            <div>
                {loading ? (
                    <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1" />
                ) : (
                    <p className="text-3xl font-bold text-black dark:text-white tabular-nums">
                        {value?.toLocaleString() ?? '—'}
                    </p>
                )}
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{title}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

// ── Period selector ───────────────────────────────────────────────────────────
type Period = 'monthly' | 'weekly' | 'daily';

const PERIOD_LABELS: Record<Period, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [timeSeries, setTimeSeries] = useState<SignupEntry[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);
    const [period, setPeriod] = useState<Period>('monthly');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user?.authenticated) router.push('/signin');
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.authenticated) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        setError(null);

        // Fetch both in parallel
        const [statsRes, seriesRes] = await Promise.allSettled([
            axios.get<UserData>('/api/office/data/user-data', { headers }),
            axios.get<SignupEntry[]>('/api/office/data/user-signup-time-series-data', { headers }),
        ]);

        if (statsRes.status === 'fulfilled') {
            setUserData(statsRes.value.data);
        } else {
            setError('Failed to load user statistics.');
        }
        setLoadingStats(false);

        if (seriesRes.status === 'fulfilled') {
            setTimeSeries(seriesRes.value.data);
        }
        setLoadingChart(false);
    };

    // Aggregate time series data based on selected period
    const chartData = useMemo<ChartPoint[]>(() => {
        if (timeSeries.length === 0) return [];

        const buckets: Record<string, number> = {};

        timeSeries.forEach(({ date_joined }) => {
            const d = new Date(date_joined);
            let key = '';
            let fullLabel = '';

            if (period === 'monthly') {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const monthName = d.toLocaleString('default', { month: 'short' });
                fullLabel = `${monthName} ${d.getFullYear()}`;
            } else if (period === 'weekly') {
                // ISO week key: year-weekNumber
                const startOfYear = new Date(d.getFullYear(), 0, 1);
                const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
                key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
                fullLabel = key;
            } else {
                key = date_joined.slice(0, 10);
                fullLabel = key;
            }

            buckets[key] = (buckets[key] || 0) + 1;
        });

        const sorted = Object.entries(buckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-52); // max 52 buckets

        return sorted.map(([key, value]) => {
            let label = key;
            if (period === 'monthly') {
                const [year, month] = key.split('-');
                const d = new Date(Number(year), Number(month) - 1, 1);
                label = d.toLocaleString('default', { month: 'short' });
                if (sorted.length > 12) label += ` '${year.slice(2)}`;
                const monthName = d.toLocaleString('default', { month: 'short' });
                return { label, value, fullLabel: `${monthName} ${year}` };
            }
            if (period === 'weekly') {
                label = key.replace(/^\d{4}-/, ''); // show "W23"
                return { label, value, fullLabel: key };
            }
            // daily
            const d = new Date(key);
            label = `${d.getMonth() + 1}/${d.getDate()}`;
            return { label, value, fullLabel: key };
        });
    }, [timeSeries, period]);

    const totalSignups = timeSeries.length;
    const recentSignups = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return timeSeries.filter(e => new Date(e.date_joined) >= cutoff).length;
    }, [timeSeries]);

    if (isLoading) return <PageLoader text="Loading users..." />;
    if (!user?.authenticated) return null;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Page header */}
            <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#22C55E]" />
                        User Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Platform-wide user statistics and growth trends
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                <StatCard
                    title="Total Users"
                    value={userData?.user_count ?? null}
                    icon={Users}
                    color="text-blue-600 dark:text-blue-400"
                    bg="bg-blue-50 dark:bg-blue-900/30"
                    loading={loadingStats}
                    subtitle="All registered accounts"
                />
                <StatCard
                    title="Pro Players"
                    value={userData?.pro_user_count ?? null}
                    icon={Trophy}
                    color="text-amber-600 dark:text-amber-400"
                    bg="bg-amber-50 dark:bg-amber-900/30"
                    loading={loadingStats}
                    subtitle="Professional accounts"
                />
                <StatCard
                    title="Historical Signups"
                    value={loadingChart ? null : totalSignups}
                    icon={Calendar}
                    color="text-purple-600 dark:text-purple-400"
                    bg="bg-purple-50 dark:bg-purple-900/30"
                    loading={loadingChart}
                    subtitle="From time series data"
                />
                <StatCard
                    title="Last 30 Days"
                    value={loadingChart ? null : recentSignups}
                    icon={TrendingUp}
                    color="text-[#22C55E]"
                    bg="bg-green-50 dark:bg-green-900/30"
                    loading={loadingChart}
                    subtitle="New registrations"
                />
            </div>

            {/* Chart card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                        <h2 className="text-lg font-bold text-black dark:text-white">User Signup Trend</h2>
                        {!loadingChart && timeSeries.length > 0 && (
                            <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                {timeSeries.length.toLocaleString()} records
                            </span>
                        )}
                    </div>

                    {/* Period toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    period === p
                                        ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                                }`}
                            >
                                {PERIOD_LABELS[p]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {loadingChart ? (
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse" />
                            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                        </div>
                    ) : (
                        <div className="text-gray-700 dark:text-gray-200">
                            <SignupLineChart data={chartData} />
                        </div>
                    )}
                </div>

                {/* Footer summary */}
                {!loadingChart && chartData.length > 0 && (
                    <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Earliest</p>
                            <p className="text-sm font-semibold text-black dark:text-white">{chartData[0]?.fullLabel}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Latest</p>
                            <p className="text-sm font-semibold text-black dark:text-white">{chartData[chartData.length - 1]?.fullLabel}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Peak {PERIOD_LABELS[period]}</p>
                            <p className="text-sm font-semibold text-black dark:text-white">
                                {(() => {
                                    const peak = chartData.reduce((a, b) => (b.value > a.value ? b : a));
                                    return `${peak.fullLabel} (${peak.value})`;
                                })()}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pro vs Amateur ratio bar */}
            {!loadingStats && userData && (
                <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4">User Composition</h2>
                    <div className="space-y-4">
                        {/* Pro users */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" /> Pro Players
                                </span>
                                <span className="text-sm font-bold text-black dark:text-white">
                                    {userData.pro_user_count.toLocaleString()}&nbsp;
                                    <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">
                                        ({((userData.pro_user_count / userData.user_count) * 100).toFixed(1)}%)
                                    </span>
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-3 bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(userData.pro_user_count / userData.user_count) * 100}%` }}
                                />
                            </div>
                        </div>
                        {/* Amateur users */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" /> Amateur Players
                                </span>
                                <span className="text-sm font-bold text-black dark:text-white">
                                    {(userData.user_count - userData.pro_user_count).toLocaleString()}&nbsp;
                                    <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">
                                        ({(((userData.user_count - userData.pro_user_count) / userData.user_count) * 100).toFixed(1)}%)
                                    </span>
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-3 bg-blue-500 rounded-full transition-all duration-700"
                                    style={{ width: `${((userData.user_count - userData.pro_user_count) / userData.user_count) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
