import React, { useState, useEffect } from 'react';
import {
    User,
    Shield,
    Key,
    Bell,
    Globe,
    CreditCard,
    Copy,
    RefreshCw,
    Eye,
    EyeOff,
    CheckCircle2
} from 'lucide-react';
import {
    getApiKeys,
    regenerateKey,
    getUsageStats,
    getProfile,
    updateProfile,
    updateSecurity,
    updateNotifications,
    updateIntegrations
} from '../utils/api';

import BackButton from '../components/ui/BackButton';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data State
    const [user, setUser] = useState({
        name: '',
        email: '',
        bio: '',
        preferences: { notifications: {} },
        integrations: {},
        security: { twoFactorEnabled: false }
    });
    const [apiKeys, setApiKeys] = useState({});
    const [usage, setUsage] = useState({
        monthlyUsage: 0,
        monthlyLimit: 100000,
        dailyRequests: 0,
        activeSessions: 0
    });

    // Form State for Password Change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, keysRes, usageRes] = await Promise.all([
                getProfile(),
                getApiKeys(),
                getUsageStats()
            ]);

            setUser(profileRes.data);

            // Convert keys array to object
            const keysObj = {};
            keysRes.data.forEach(key => {
                keysObj[key.service] = key.keyPreview;
            });
            setApiKeys(keysObj);

            setUsage(usageRes.data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            const res = await updateProfile({
                name: user.name,
                email: user.email,
                bio: user.bio
            });
            alert('Profile updated successfully!');
            setUser(prev => ({ ...prev, ...res.data }));
        } catch (err) {
            alert('Failed to update profile: ' + (err.response?.data?.msg || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleSecurityUpdate = async () => {
        if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
            return alert('New passwords do not match');
        }

        setSaving(true);
        try {
            await updateSecurity({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                twoFactorEnabled: user.security?.twoFactorEnabled
            });
            alert('Security settings updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert('Failed to update security: ' + (err.response?.data?.msg || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationToggle = async (type) => {
        const newValue = !user.preferences?.notifications?.[type];
        // Optimistic update
        setUser(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                notifications: {
                    ...prev.preferences?.notifications,
                    [type]: newValue
                }
            }
        }));

        try {
            await updateNotifications({ [type]: newValue });
        } catch (err) {
            console.error('Failed to update notification:', err);
            // Revert on error
            setUser(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    notifications: {
                        ...prev.preferences?.notifications,
                        [type]: !newValue
                    }
                }
            }));
        }
    };

    const handleIntegrationToggle = async (service) => {
        const newValue = !user.integrations?.[service];
        // Optimistic update
        setUser(prev => ({
            ...prev,
            integrations: {
                ...prev.integrations,
                [service]: newValue
            }
        }));

        try {
            await updateIntegrations({ service, enabled: newValue });
        } catch (err) {
            console.error('Failed to update integration:', err);
            // Revert
            setUser(prev => ({
                ...prev,
                integrations: {
                    ...prev.integrations,
                    [service]: !newValue
                }
            }));
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-100 flex font-['Inter']">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="mb-4">
                        <BackButton to="/dashboard" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Settings
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Manage your workspace</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <SidebarItem icon={<User />} label="Profile Settings" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    <SidebarItem icon={<Shield />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    <SidebarItem icon={<Key />} label="API Keys" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
                    <SidebarItem icon={<Bell />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                    <SidebarItem icon={<Globe />} label="Integrations" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
                    <SidebarItem icon={<CreditCard />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">

                    {/* Profile Settings Tab */}
                    {activeTab === 'profile' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
                                <p className="text-gray-400">Manage your personal information and preferences.</p>
                            </div>

                            <div className="glass-panel p-6 rounded-xl border border-gray-800 mb-6">
                                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                                            <input
                                                type="text"
                                                value={user.name || ''}
                                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                value={user.email || ''}
                                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio</label>
                                        <textarea
                                            rows="3"
                                            value={user.bio || ''}
                                            onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleProfileUpdate}
                                            disabled={saving}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">Security Settings</h1>
                                <p className="text-gray-400">Manage your account security and privacy.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleSecurityUpdate}
                                                disabled={saving || !passwordData.currentPassword}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {saving ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                    <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-white">Enable 2FA</p>
                                            <p className="text-sm text-gray-400">Add an extra layer of security</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newVal = !user.security?.twoFactorEnabled;
                                                setUser({ ...user, security: { ...user.security, twoFactorEnabled: newVal } });
                                                updateSecurity({ twoFactorEnabled: newVal });
                                            }}
                                            className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${user.security?.twoFactorEnabled ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                                        >
                                            {user.security?.twoFactorEnabled ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">Notification Preferences</h1>
                                <p className="text-gray-400">Choose how you want to be notified.</p>
                            </div>

                            <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                <div className="space-y-6">
                                    {['email', 'meeting', 'chat'].map(type => (
                                        <div key={type} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                                            <div>
                                                <p className="font-medium text-white capitalize">{type} Notifications</p>
                                                <p className="text-sm text-gray-400">Receive {type} alerts</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user.preferences?.notifications?.[type] || false}
                                                    onChange={() => handleNotificationToggle(type)}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === 'integrations' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">Integrations</h1>
                                <p className="text-gray-400">Connect third-party services and tools.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { name: 'Slack', service: 'slack', icon: '💬', color: 'purple' },
                                    { name: 'Google Calendar', service: 'google', icon: '📅', color: 'blue' },
                                    { name: 'Zoom', service: 'zoom', icon: '📹', color: 'indigo' },
                                    { name: 'Microsoft Teams', service: 'teams', icon: '🎯', color: 'blue' },
                                    { name: 'Notion', service: 'notion', icon: '📝', color: 'gray' },
                                    { name: 'Zapier', service: 'zapier', icon: '⚡', color: 'orange' }
                                ].map((integration) => (
                                    <div key={integration.service} className="glass-panel p-6 rounded-xl border border-gray-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{integration.icon}</span>
                                                <div>
                                                    <h3 className="font-semibold text-white">{integration.name}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        {user.integrations?.[integration.service] ? 'Connected' : 'Not connected'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleIntegrationToggle(integration.service)}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${user.integrations?.[integration.service]
                                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                                    }`}>
                                                {user.integrations?.[integration.service] ? 'Disconnect' : 'Connect'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">Billing & Plans</h1>
                                <p className="text-gray-400">Manage your subscription and payment methods.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                                            <p className="text-gray-400 capitalize">{user.billing?.plan || 'Free'} Plan</p>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
                                            Upgrade Plan
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-400">{usage.monthlyUsage}</p>
                                            <p className="text-xs text-gray-400 mt-1">API Calls Used</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-400">{usage.activeSessions}</p>
                                            <p className="text-xs text-gray-400 mt-1">Active Sessions</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                                            <p className="text-2xl font-bold text-purple-400">Unlimited</p>
                                            <p className="text-xs text-gray-400 mt-1">Storage</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* API Keys Tab */}
                    {activeTab === 'api' && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">API Configuration</h1>
                                <p className="text-gray-400">Manage your secret keys and API access tokens.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="glass-panel p-5 rounded-xl border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-1">Monthly Usage</p>
                                    <h3 className="text-2xl font-bold text-white">
                                        {loading ? '...' : usage.monthlyUsage.toLocaleString()}
                                        <span className="text-sm font-normal text-gray-500"> / {(usage.monthlyLimit / 1000).toFixed(0)}k</span>
                                    </h3>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${Math.min((usage.monthlyUsage / usage.monthlyLimit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="glass-panel p-5 rounded-xl border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-1">Daily Requests</p>
                                    <h3 className="text-2xl font-bold text-white">{loading ? '...' : usage.dailyRequests.toLocaleString()}</h3>
                                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Operational
                                    </p>
                                </div>
                                <div className="glass-panel p-5 rounded-xl border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-1">Active Sessions</p>
                                    <h3 className="text-2xl font-bold text-white">{loading ? '...' : usage.activeSessions}</h3>
                                    <p className="text-xs text-blue-400 mt-2">Currently running</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Globe className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white">LiveKit Credentials</h3>
                                                <p className="text-sm text-gray-400">For real-time video and audio capability</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                            Active
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <InputField
                                            label="API Key"
                                            value={loading ? 'Loading...' : (apiKeys.livekit || 'Not set')}
                                            service="livekit"
                                            onRefresh={fetchData}
                                        />
                                        <InputField
                                            label="Secret Key"
                                            value={loading ? 'Loading...' : (apiKeys.livekit || 'Not set')}
                                            isSecret
                                            copyable
                                            regenerable
                                            service="livekit"
                                            onRefresh={fetchData}
                                        />
                                    </div>
                                </div>

                                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                <div className="w-5 h-5 text-purple-400 font-bold">AI</div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white">OpenAI Configuration</h3>
                                                <p className="text-sm text-gray-400">Manage LLM processing keys</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                                            Limited Access
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <InputField
                                            label="Secret Key"
                                            value={loading ? 'Loading...' : (apiKeys.openai || 'Not set')}
                                            isSecret
                                            copyable
                                            regenerable
                                            service="openai"
                                            onRefresh={fetchData}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`
            flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
            ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}
        `}
    >
        {React.cloneElement(icon, { size: 18 })}
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const InputField = ({ label, value, isSecret, copyable, regenerable, service, onRefresh }) => {
    const [show, setShow] = useState(!isSecret);
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        if (!confirm(`Are you sure you want to regenerate the ${service} key? The old key will be invalidated.`)) {
            return;
        }

        setRegenerating(true);
        try {
            const response = await regenerateKey(service);
            alert(`Key regenerated!\n\nNew key: ${response.data.key.fullKey}\n\nPlease copy this key now. It will only be shown once.`);
            if (onRefresh) onRefresh();
        } catch (err) {
            alert('Failed to regenerate key: ' + (err.response?.data?.msg || err.message));
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type={show ? "text" : "password"}
                        value={value}
                        readOnly
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {isSecret && (
                        <button
                            onClick={() => setShow(!show)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>

                {copyable && (
                    <button
                        onClick={handleCopy}
                        className="px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center min-w-[44px]"
                        title="Copy to clipboard"
                    >
                        {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                )}

                {regenerable && (
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center min-w-[44px] disabled:opacity-50"
                        title="Regenerate Key"
                    >
                        <RefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Settings;
