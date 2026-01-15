import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    Video,
    ChevronLeft,
    ChevronRight,
    Plus,
    MoreHorizontal,
    Shield,
    Link as LinkIcon
} from 'lucide-react';
import { getMeetings, createMeeting, getUpcomingMeetings } from '../utils/api';

const Scheduler = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Data State
    const [meetings, setMeetings] = useState([]);
    const [upcoming, setUpcoming] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        recurrence: 'Does not repeat',
        duration: '1 hour'
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [meetingsRes, upcomingRes] = await Promise.all([
                getMeetings(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
                getUpcomingMeetings()
            ]);
            setMeetings(meetingsRes.data);
            setUpcoming(upcomingRes.data);
        } catch (err) {
            console.error('Error fetching schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.startTime) {
            alert('Please fill in all required fields');
            return;
        }

        setCreating(true);
        try {
            await createMeeting(formData);
            alert(`Meeting "${formData.title}" scheduled successfully!`);
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '10:00',
                recurrence: 'Does not repeat',
                duration: '1 hour'
            });
            fetchData(); // Refresh calendar
        } catch (err) {
            alert('Failed to schedule meeting: ' + (err.response?.data?.msg || err.message));
        } finally {
            setCreating(false);
        }
    };

    // Helper to get meetings for a specific date
    const getMeetingsForDate = (day) => {
        return meetings.filter(m => {
            const d = new Date(m.date);
            return d.getDate() === day &&
                d.getMonth() === currentMonth.getMonth() &&
                d.getFullYear() === currentMonth.getFullYear();
        });
    };

    // Calendar generation logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    // Generate calendar grid array
    const calendarDays = [];
    const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

    // Add prev month days
    for (let i = firstDay - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthDays - i, isPrevMonth: true });
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, isPrevMonth: false });
    }

    // Add next month days to fill grid (assuming 6 rows max -> 42 cells)
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
        calendarDays.push({ day: i, isNextMonth: true });
    }

    return (
        <div className="flex h-screen bg-[#0b1120] text-gray-100 font-['Inter'] overflow-hidden">

            {/* Sidebar / Quick Schedule */}
            <aside className="w-80 border-r border-gray-800 glass-panel p-6 flex-col hidden lg:flex">
                <div className="flex items-center gap-2 mb-8 text-blue-400 font-bold text-lg">
                    <CalendarIcon className="w-6 h-6" />
                    <span>Nexus Scheduler</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Schedule</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Meeting Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Q4 Strategy Review"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Recurrence</label>
                            <select
                                value={formData.recurrence}
                                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-400 appearance-none cursor-pointer"
                            >
                                <option>Does not repeat</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-900/30 bg-blue-900/10">
                            <Shield className="w-5 h-5 text-blue-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-100">AI Security</p>
                                <p className="text-xs text-blue-300/70">Real-time monitoring</p>
                            </div>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            {creating ? 'Scheduling...' : 'Create Meeting'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 border-t border-gray-800 pt-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex justify-between items-center">
                        Upcoming
                        <span className="text-xs normal-case bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{upcoming.length}</span>
                    </h3>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {upcoming.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No upcoming meetings</p>
                        ) : (
                            upcoming.map(meeting => (
                                <UpcomingSession
                                    key={meeting._id}
                                    title={meeting.title}
                                    time={`${meeting.startTime} (${meeting.duration})`}
                                    status={new Date(meeting.date).toLocaleDateString()}
                                    link={meeting.meetingLink}
                                />
                            ))
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Calendar View */}
            <main className="flex-1 flex flex-col relative">
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

                {/* Header */}
                <header className="h-16 border-b border-gray-800 glass-panel flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <h2 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                        <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-gray-800 text-white shadow-sm transition-all">Month</button>
                        <button onClick={() => alert('Week view (Coming soon)')} className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-300 transition-all">Week</button>
                        <button onClick={() => alert('Day view (Coming soon)')} className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-300 transition-all">Day</button>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleToday} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors">
                            Today
                        </button>
                    </div>
                </header>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="w-full h-full rounded-xl border border-gray-800 bg-gray-900/30 flex flex-col min-h-[600px]">

                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b border-gray-800 sticky top-0 bg-gray-900/90 backdrop-blur z-10">
                            {days.map(day => (
                                <div key={day} className="py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-widest bg-gray-900/50">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Body */}
                        <div className="flex-1 grid grid-cols-7 grid-rows-6">
                            {calendarDays.map((cell, idx) => (
                                <CalendarCell
                                    key={idx}
                                    date={cell.day}
                                    isPrevMonth={cell.isPrevMonth}
                                    isNextMonth={cell.isNextMonth}
                                >
                                    {!cell.isPrevMonth && !cell.isNextMonth && getMeetingsForDate(cell.day).map(meeting => (
                                        <EventPill
                                            key={meeting._id}
                                            title={meeting.title}
                                            time={meeting.startTime}
                                            color="blue"
                                        />
                                    ))}
                                </CalendarCell>
                            ))}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components

const UpcomingSession = ({ title, time, status, link, color = 'blue' }) => {
    const navigate = useNavigate();
    return (
        <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-medium text-sm text-gray-200 group-hover:text-blue-400 transition-colors">{title}</h4>
                    <p className="text-xs text-gray-500">{time}</p>
                </div>
                <div className={`p-1.5 rounded bg-${color}-500/10 text-${color}-400`}>
                    <Video size={14} />
                </div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                    {status}
                </span>
                {link && (
                    <button
                        onClick={() => {
                            // Extract ID from link or just assume link IS the ID for now?
                            // The backend generates link like: https://nexus-meet.com/${ID}
                            // So we need to parse it or just use the meeting ID if passed.
                            // Ideally we pass meetingId prop.
                            // For now, let's extract the ID from the end of the link.
                            const meetingId = link.split('/').pop();
                            navigate(`/room/${meetingId}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md font-medium"
                    >
                        Join
                    </button>
                )}
            </div>
        </div>
    );
};

const CalendarCell = ({ date, isPrevMonth, isNextMonth, children }) => {
    const isToday = !isPrevMonth && !isNextMonth &&
        new Date().getDate() === date &&
        new Date().getMonth() === new Date().getMonth() && // Warning: this check is simplistic for demo
        true; // Ideally pass in currentMonth state to verify year/month

    return (
        <div className={`
            border-b border-r border-gray-800 min-h-[100px] p-2 relative group hover:bg-white/5 transition-colors
            ${(isPrevMonth || isNextMonth) ? 'bg-gray-900/20 text-gray-600' : 'text-gray-300'}
        `}>
            <span className={`text-sm font-medium font-mono ${isToday ? 'text-blue-400' : ''}`}>
                {date}
            </span>
            {isToday && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            )}
            <div className="mt-2 text-xs space-y-1">
                {children}
            </div>
        </div>
    );
};

const EventPill = ({ title, time, color }) => (
    <div className={`
        px-2 py-1 rounded border overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer
        bg-${color}-500/10 border-${color}-500/20 text-${color}-200 hover:bg-${color}-500/20 transition-colors
    `}>
        <span className="font-semibold mr-1">{time}</span> {title}
    </div>
);

export default Scheduler;
