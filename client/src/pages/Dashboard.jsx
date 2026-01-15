import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContextDefinition';
import { Video, Calendar, MessageSquare, History, Settings as SettingsIcon, Users, LogOut, Plus } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [starting, setStarting] = useState(false);

    const startMeeting = async () => {
        setStarting(true);
        try {
            const res = await api.post('/meetings/start');
            navigate(`/room/${res.data.meetingId}`);
        } catch (err) {
            console.error('Failed to start meeting', err);
            alert('Failed to start meeting');
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#0b1120] text-gray-100 font-['Inter']">
            {/* Header */}
            <header className="border-b border-gray-800 glass-panel">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Zoomerrrrlive</h1>
                            <p className="text-xs text-gray-400">AI-Powered Meetings</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">Admin</Link>
                        <Link to="/history" className="text-sm text-gray-400 hover:text-white transition-colors">History</Link>
                        <Link to="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">Settings</Link>
                        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
                    </h2>
                    <p className="text-gray-400">Here's what's happening with your team today.</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <QuickActionCard
                        icon={<Video className="w-6 h-6" />}
                        title="Start Meeting"
                        description="Launch instant call"
                        color="blue"
                        onClick={startMeeting}
                        disabled={starting}
                    />
                    <QuickActionCard
                        icon={<Calendar className="w-6 h-6" />}
                        title="Schedule"
                        description="Plan ahead"
                        color="purple"
                        onClick={() => navigate('/schedule')}
                    />
                    <QuickActionCard
                        icon={<MessageSquare className="w-6 h-6" />}
                        title="Chat"
                        description="Team messages"
                        color="green"
                        onClick={() => navigate('/chat')}
                    />
                    <QuickActionCard
                        icon={<History className="w-6 h-6" />}
                        title="Call Logs"
                        description="View history"
                        color="orange"
                        onClick={() => navigate('/history')}
                    />
                </div>

                {/* Main CTA */}
                <div className="glass-panel rounded-2xl border border-gray-800 p-8 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Join or Start a Call</h3>
                            <p className="text-gray-400">Start an instant meeting with AI transcription enabled or enter a code to join an existing session.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button
                                onClick={startMeeting}
                                disabled={starting}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5" />
                                {starting ? 'Starting...' : 'Start New Meeting'}
                            </button>
                            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Enter meeting code"
                                    className="bg-transparent border-none px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none w-full"
                                />
                                <button className="px-4 py-3 text-blue-400 hover:text-blue-300 font-medium text-sm">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Status & Recent Sessions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Team Availability */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Team Availability</h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                        </div>
                        <div className="glass-panel rounded-xl border border-gray-800 p-4 space-y-3">
                            <TeamMember name="Sarah Jenkins" role="Product Manager" status="online" />
                            <TeamMember name="Mike Ross" role="In a meeting" status="busy" />
                            <TeamMember name="Harvey Specter" role="Legal Counsel" status="online" />
                            <TeamMember name="Jessica Pearson" role="Offline" status="offline" />
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Recent Sessions</h3>
                            <Link to="/history" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                        </div>
                        <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-900/50 border-b border-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Meeting</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        <SessionRow
                                            title="Q3 Product Roadmap"
                                            participants={8}
                                            date="Today, 10:00 AM"
                                            duration="45m 12s"
                                            status="Ready"
                                        />
                                        <SessionRow
                                            title="1:1 Review - Alex"
                                            participants={2}
                                            date="Yesterday, 2:30 PM"
                                            duration="28m 05s"
                                            status="Ready"
                                        />
                                        <SessionRow
                                            title="Sprint Planning"
                                            participants={12}
                                            date="Oct 22, 11:00 AM"
                                            duration="1h 15m"
                                            status="Processing"
                                        />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

// Sub-components

const QuickActionCard = ({ icon, title, description, color, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`glass-panel p-6 rounded-xl border border-gray-800 hover:border-${color}-500/30 transition-all group text-left disabled:opacity-50`}
    >
        <div className={`w-12 h-12 rounded-lg bg-${color}-500/10 flex items-center justify-center mb-4 text-${color}-400 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
    </button>
);

const TeamMember = ({ name, role, status }) => {
    const statusConfig = {
        online: 'bg-green-500',
        busy: 'bg-red-500',
        offline: 'bg-gray-500'
    };

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                    {name.charAt(0)}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusConfig[status]} rounded-full border-2 border-[#0b1120]`}></div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{name}</p>
                <p className="text-xs text-gray-400 truncate">{role}</p>
            </div>
        </div>
    );
};

const SessionRow = ({ title, participants, date, duration, status }) => (
    <tr className="hover:bg-gray-800/30 transition-colors">
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs text-gray-400">{participants} Participants</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-400">{date}</td>
        <td className="px-4 py-3 text-sm text-gray-400">{duration}</td>
        <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status === 'Ready' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                {status}
            </span>
        </td>
    </tr>
);

export default Dashboard;
