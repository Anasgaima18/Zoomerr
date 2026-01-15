import React, { useState, useEffect } from 'react';
import {
    Shield,
    Activity,
    Users,
    FileText,
    AlertTriangle,
    Search,
    Bell,
    Menu,
    LogOut,
    CheckCircle,
    XCircle,
    Clock,
    Settings as SettingsIcon,
    RefreshCw,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Lock,
    Unlock,
    Trash2,
    Eye
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    getAdminStats,
    getHighRiskSessions,
    getSecurityFeed,
    getAnalyticsData,
    getAdminUsers,
    getAdminTranscriptions
} from '../utils/api';

const AdminDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Data State
    const [stats, setStats] = useState({
        activeCalls: 0,
        totalTranscriptions: 0,
        threatLevel: 'LOW',
        threatDescription: 'System Normal',
        systemLoad: '0%',
        recentAlerts: 0
    });
    const [sessions, setSessions] = useState([]);
    const [feed, setFeed] = useState([]);
    const [anomalyData, setAnomalyData] = useState([]);
    const [users, setUsers] = useState([]);
    const [transcriptions, setTranscriptions] = useState([]);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Define callbacks BEFORE useEffects that reference them
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, sessionsRes, feedRes, analyticsRes] = await Promise.all([
                getAdminStats(),
                getHighRiskSessions(),
                getSecurityFeed(),
                getAnalyticsData(timeRange)
            ]);

            setStats(statsRes.data);
            setSessions(sessionsRes.data);
            setFeed(feedRes.data);
            setAnomalyData(analyticsRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = React.useCallback(async () => {
        try {
            const res = await getAnalyticsData(timeRange);
            setAnomalyData(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    }, [timeRange]);

    const fetchUsers = React.useCallback(async () => {
        try {
            const res = await getAdminUsers();
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, []);

    const fetchTranscriptions = React.useCallback(async () => {
        try {
            const res = await getAdminTranscriptions();
            setTranscriptions(res.data);
        } catch (err) {
            console.error('Error fetching transcriptions:', err);
        }
    }, []);

    // Now the useEffects that depend on these callbacks
    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'transcriptions') fetchTranscriptions();
    }, [activeTab, fetchUsers, fetchTranscriptions]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const getThreatColor = (level) => {
        switch (level) {
            case 'HIGH': return 'red';
            case 'MEDIUM': return 'orange';
            default: return 'green';
        }
    };

    return (
        <div className="flex h-screen bg-[#0b1120] text-gray-100 font-['Inter'] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 glass-panel flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin<span className="text-blue-500">Secure</span></span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItem
                        icon={<Activity />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<Users />}
                        label="Users & Access"
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="Transcriptions"
                        active={activeTab === 'transcriptions'}
                        badge={stats.activeCalls > 0 ? stats.activeCalls : null}
                        onClick={() => setActiveTab('transcriptions')}
                    />
                    <NavItem
                        icon={<AlertTriangle />}
                        label="Security Alerts"
                        active={activeTab === 'alerts'}
                        badge={stats.recentAlerts > 0 ? stats.recentAlerts : null}
                        badgeColor="bg-red-500"
                        onClick={() => setActiveTab('alerts')}
                    />
                    <NavItem
                        icon={<SettingsIcon />}
                        label="System Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

                {/* Header */}
                <header className="h-16 border-b border-gray-800 glass-panel flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {activeTab === 'dashboard' ? 'System Overview' :
                                activeTab === 'users' ? 'User Management' :
                                    activeTab === 'transcriptions' ? 'Transcription Logs' :
                                        activeTab === 'alerts' ? 'Security Alerts' : 'System Settings'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search logs, users, alerts..."
                                className="bg-gray-900/50 border border-gray-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-64 transition-all text-white"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-400">{currentTime.toLocaleDateString()}</p>
                                <p className="text-sm font-medium font-mono text-blue-400">{currentTime.toLocaleTimeString()}</p>
                            </div>
                            <button
                                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                                onClick={fetchDashboardData}
                                title="Refresh Data"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
                                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* DASHBOARD VIEW */}
                        {activeTab === 'dashboard' && (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Active Calls"
                                        value={stats.activeCalls}
                                        icon={<Users className="w-5 h-5 text-blue-400" />}
                                        color="blue"
                                    />
                                    <StatCard
                                        title="Transcriptions"
                                        value={stats.totalTranscriptions.toLocaleString()}
                                        icon={<FileText className="w-5 h-5 text-purple-400" />}
                                        color="purple"
                                    />
                                    <StatCard
                                        title="Threat Level"
                                        value={stats.threatLevel}
                                        label={stats.threatDescription}
                                        icon={<Shield className={`w-5 h-5 text-${getThreatColor(stats.threatLevel)}-400`} />}
                                        color={getThreatColor(stats.threatLevel)}
                                    />
                                    <StatCard
                                        title="System Load"
                                        value={stats.systemLoad}
                                        icon={<Activity className="w-5 h-5 text-orange-400" />}
                                        color="orange"
                                    />
                                </div>

                                {/* Main Charts Area */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Anomaly Detection Chart */}
                                    <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-gray-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-lg font-semibold">Transcription Anomaly Detection</h2>
                                                <p className="text-sm text-gray-400">Real-time monitoring of keyword flags</p>
                                            </div>
                                            <div className="flex gap-2 text-sm">
                                                <button
                                                    onClick={() => setTimeRange('24h')}
                                                    className={`px-3 py-1 rounded-lg transition-colors ${timeRange === '24h' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                >24H</button>
                                                <button
                                                    onClick={() => setTimeRange('7d')}
                                                    className={`px-3 py-1 rounded-lg transition-colors ${timeRange === '7d' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                >7D</button>
                                                <button
                                                    onClick={() => setTimeRange('30d')}
                                                    className={`px-3 py-1 rounded-lg transition-colors ${timeRange === '30d' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 hover:bg-gray-700'}`}
                                                >30D</button>
                                            </div>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={anomalyData}>
                                                    <defs>
                                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                                    <XAxis dataKey="time" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                    <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }}
                                                        itemStyle={{ color: '#60a5fa' }}
                                                    />
                                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Live Security Feed */}
                                    <div className="glass-panel rounded-xl p-6 border border-gray-800 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                Live Feed
                                            </h2>
                                            <button onClick={() => setActiveTab('alerts')} className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                                        </div>
                                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[300px]">
                                            {feed.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center py-4">No recent alerts</p>
                                            ) : (
                                                feed.map((alert, idx) => (
                                                    <SecurityAlert
                                                        key={idx}
                                                        priority={alert.priority}
                                                        title={alert.title}
                                                        time={alert.time}
                                                        desc={alert.desc}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent High Risk Sessions */}
                                <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
                                    <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold">Monitor High Risk Sessions</h2>
                                            <p className="text-sm text-gray-400">Sessions flagged with &gt; 80% risk score</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                        {sessions.length === 0 ? (
                                            <div className="col-span-3 text-center py-8 text-gray-500">
                                                No high-risk sessions detected.
                                            </div>
                                        ) : (
                                            sessions.map((session, idx) => (
                                                <RiskSessionCard
                                                    key={idx}
                                                    {...session}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* USERS VIEW */}
                        {activeTab === 'users' && (
                            <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Registered Users</h2>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg">
                                        Add User
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase border-b border-gray-700">
                                                <th className="px-6 py-4 font-medium">User</th>
                                                <th className="px-6 py-4 font-medium">Email</th>
                                                <th className="px-6 py-4 font-medium">Role</th>
                                                <th className="px-6 py-4 font-medium">Joined</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {users.map((user) => (
                                                <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        {user.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                                                            User
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="flex items-center gap-1.5 text-green-400">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TRANSCRIPTIONS VIEW */}
                        {activeTab === 'transcriptions' && (
                            <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-800">
                                    <h2 className="text-lg font-semibold">All Transcriptions</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase border-b border-gray-700">
                                                <th className="px-6 py-4 font-medium">ID</th>
                                                <th className="px-6 py-4 font-medium">Session Type</th>
                                                <th className="px-6 py-4 font-medium">Date/Time</th>
                                                <th className="px-6 py-4 font-medium">Duration</th>
                                                <th className="px-6 py-4 font-medium">Transcripts</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {transcriptions.map((call) => (
                                                <tr key={call._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{call.roomId}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">
                                                            {call.type || 'Standard'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        {new Date(call.startedAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">
                                                        {call.endedAt ? (
                                                            Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 60000) + ' mins'
                                                        ) : (
                                                            <span className="text-green-400 animate-pulse">Live</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-blue-400" />
                                                            <span>{call.transcriptCount || 0} segments</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                        <button className="p-1.5 hover:bg-blue-600/20 text-blue-400 rounded transition-colors" title="View Transcript">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-colors" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ALERTS VIEW */}
                        {activeTab === 'alerts' && (
                            <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-800">
                                    <h2 className="text-lg font-semibold">Security Alerts Log</h2>
                                </div>
                                <div className="p-6">
                                    {feed.length === 0 ? (
                                        <p className="text-center text-gray-500">No alerts found.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {feed.map((alert, idx) => (
                                                <div key={idx} className={`p-4 rounded-lg border border-gray-800 bg-opacity-30 flex items-start justify-between ${alert.priority === 'critical' ? 'bg-red-900/10 border-red-900/30' :
                                                    alert.priority === 'warning' ? 'bg-orange-900/10 border-orange-900/30' :
                                                        'bg-blue-900/10 border-blue-900/30'
                                                    }`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 p-2 rounded-full ${alert.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                            alert.priority === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            <AlertTriangle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-semibold ${alert.priority === 'critical' ? 'text-red-400' :
                                                                alert.priority === 'warning' ? 'text-orange-400' :
                                                                    'text-blue-400'
                                                                }`}>{alert.title}</h4>
                                                            <p className="text-gray-300 mt-1">{alert.desc}</p>
                                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                                                                {alert.roomId && <span className="font-mono bg-gray-900 px-2 py-0.5 rounded border border-gray-800">{alert.roomId}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 rounded transition-colors">
                                                        Investigate
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SETTINGS VIEW */}
                        {activeTab === 'settings' && (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                    <h2 className="text-lg font-semibold mb-4">Admin Configurations</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                                            <div>
                                                <p className="font-medium">Admin Mode Protection</p>
                                                <p className="text-sm text-gray-400">Require 2FA for all admin actions</p>
                                            </div>
                                            <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                                            <div>
                                                <p className="font-medium">System Downscaling</p>
                                                <p className="text-sm text-gray-400">Auto-archive logs older than 30 days</p>
                                            </div>
                                            <div className="w-11 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-full font-medium transition-colors">
                                        Save Configuration
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                    {/* Footer */}
                    <div className="mt-12 text-center text-sm text-gray-600 pb-6">
                        &copy; 2024 Zoomerrrrlive Admin Console. Licensed to Nexus Corp.
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components

const NavItem = ({ icon, label, active, badge, badgeColor, onClick }) => (
    <div
        onClick={onClick}
        className={`
        flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
        ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}
    `}>
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { size: 20 })}
            <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${badgeColor || 'bg-gray-700'}`}>
                {badge}
            </span>
        )}
    </div>
);

const StatCard = ({ title, value, label, icon, color }) => (
    <div className="glass-panel p-6 rounded-xl border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-colors">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-${color}-500 blur-2xl rounded-full w-24 h-24 -mr-10 -mt-10`}></div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-${color}-500/10`}>
                {icon}
            </div>
        </div>
        <div className="flex items-center text-sm">
            {label && <span className="text-green-400 font-medium">{label}</span>}
            {!label && <span className="text-gray-500">Updated just now</span>}
        </div>
    </div>
);

const SecurityAlert = ({ priority, title, time, desc }) => {
    const colors = {
        critical: 'border-l-red-500 bg-red-500/5',
        warning: 'border-l-orange-500 bg-orange-500/5',
        info: 'border-l-blue-500 bg-blue-500/5'
    };

    return (
        <div className={`p-3 rounded-r-lg border-l-4 ${colors[priority]} border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer group`}>
            <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm text-gray-200 group-hover:text-blue-400 transition-colors">{title}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{desc}</p>
        </div>
    );
};

const RiskSessionCard = ({ id, risk, participants, duration, topic, flags }) => (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors">
        <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono text-gray-500">{id}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${risk > 90 ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                risk > 70 ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                }`}>
                Risk: {risk}%
            </span>
        </div>
        <h4 className="font-medium text-white mb-1">{topic}</h4>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
            <div className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {participants}
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {duration}
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
            {flags && flags.map((flag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {flag}
                </span>
            ))}
        </div>
    </div>
);

export default AdminDashboard;
