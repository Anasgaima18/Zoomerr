import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    Download,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Loader,
    Trash2
} from 'lucide-react';
import { getCallHistory, deleteCall } from '../utils/api';
import BackButton from '../components/ui/BackButton';

const CallHistory = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, safe, flagged
    const [currentPage, setCurrentPage] = useState(1);
    const [calls, setCalls] = useState([]);
    const [totalCalls, setTotalCalls] = useState(0);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchCalls();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusFilter, searchQuery]);

    const fetchCalls = async () => {
        setLoading(true);
        try {
            const res = await getCallHistory({
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchQuery || undefined
            });
            setCalls(res.data.calls || []);
            setTotalCalls(res.data.total || 0);
        } catch (err) {
            console.error('Error fetching call history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCall = async (id) => {
        if (!window.confirm('Are you sure you want to delete this call record?')) return;
        try {
            await deleteCall(id);
            fetchCalls(); // Refresh list
        } catch (err) {
            console.error('Error deleting call:', err);
            alert('Failed to delete call');
        }
    };

    const totalPages = Math.ceil(totalCalls / itemsPerPage);

    const handleExportCSV = () => {
        const csv = [
            ['ID', 'Date', 'Time', 'Participants', 'Duration', 'Status', 'Risk'],
            ...calls.map(c => [
                c.roomId || c._id,
                new Date(c.startedAt).toLocaleDateString(),
                new Date(c.startedAt).toLocaleTimeString(),
                (c.participants || []).join('; '),
                c.duration || 'N/A',
                c.isActive ? 'Active' : 'Completed',
                c.risk || 'Low'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'call-history.csv';
        a.click();
    };

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-100 font-['Inter'] p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="mb-4">
                            <BackButton to="/dashboard" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Historical Logs
                        </h1>
                        <p className="text-gray-400 mt-1">Archive of all past sessions and security reports.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                        >
                            <Download size={18} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="glass-panel p-4 rounded-xl border border-gray-800 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by ID, participant, or keyword..."
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => alert('Date range picker (Coming soon)')}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-sm whitespace-nowrap transition-colors"
                        >
                            <Calendar size={16} className="text-gray-400" />
                            <span>Date Range</span>
                        </button>
                        <button
                            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors font-medium ${statusFilter === 'all' ? 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border-blue-600/20' : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                                }`}
                        >
                            <span>All Statuses</span>
                        </button>
                        <button
                            onClick={() => { setStatusFilter('safe'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors ${statusFilter === 'safe' ? 'bg-green-600/10 hover:bg-green-600/20 text-green-400 border-green-600/20' : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                                }`}
                        >
                            <CheckCircle size={16} className="text-green-500" />
                            <span>Safe Only</span>
                        </button>
                        <button
                            onClick={() => { setStatusFilter('flagged'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors ${statusFilter === 'flagged' ? 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-600/20' : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                                }`}
                        >
                            <AlertTriangle size={16} className="text-red-500" />
                            <span>Flagged</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <Loader className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Session Details</th>
                                    <th className="px-6 py-4 font-medium">Participants</th>
                                    <th className="px-6 py-4 font-medium">Duration</th>
                                    <th className="px-6 py-4 font-medium">Safety Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {calls.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            No call history found.
                                        </td>
                                    </tr>
                                )}
                                {calls.map((call, index) => (
                                    <tr key={call._id || index} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded bg-gray-800 text-gray-400">
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-200">{new Date(call.startedAt).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500">{new Date(call.startedAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(call.participants || []).slice(0, 3).map((p, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                                                        {typeof p === 'string' ? p : (p.name || 'User')}
                                                    </span>
                                                ))}
                                                {(call.participants || []).length > 3 && (
                                                    <span className="text-xs px-2 py-1 text-gray-500">+{call.participants.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                                            {call.duration || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`
                                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                                                ${call.isActive
                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    : 'bg-green-500/10 text-green-400 border-green-500/20'}
                                            `}>
                                                {call.isActive ? <Clock size={12} /> : <CheckCircle size={12} />}
                                                {call.isActive ? 'Active' : 'Completed'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3 mt-3">
                                            {call.isActive ? (
                                                <button
                                                    onClick={() => window.location.href = `/room/${call.roomId}`} // Simple nav for now
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                                >
                                                    Rejoin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteCall(call._id)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete Call"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Showing <span className="text-gray-300 font-medium">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCalls)}</span> of <span className="text-gray-300 font-medium">{totalCalls}</span> logs
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CallHistory;
