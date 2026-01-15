import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSocket } from '../context/useSocket';
import { useAudioCapture } from '../utils/audioCapture.js';
import { AuthContext } from '../context/AuthContextDefinition';
import api from '../utils/api';
import {
    Mic,
    MicOff,
    FileText,
    AlertTriangle,
    Sparkles,
    Activity,
    Clock,
    User,
    ChevronDown,
    Loader2,
    CheckCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TranscriptionPanel = ({ roomId, callId, enabled = true }) => {
    const socket = useSocket();
    const { user } = useContext(AuthContext);
    const { startCapture, stopCapture, isCapturing } = useAudioCapture();
    const [transcripts, setTranscripts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState('');
    const [status, setStatus] = useState('idle'); // idle, starting, active, stopping
    const [activeTab, setActiveTab] = useState('transcripts');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const transcriptListRef = useRef(null);
    const alertListRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (activeTab === 'transcripts' && transcriptListRef.current) {
            transcriptListRef.current.scrollTop = transcriptListRef.current.scrollHeight;
        } else if (activeTab === 'alerts' && alertListRef.current) {
            alertListRef.current.scrollTop = alertListRef.current.scrollHeight;
        }
    }, [transcripts, alerts, activeTab]);

    useEffect(() => {
        if (!socket || !enabled) return;

        if (roomId) {
            socket.emit('join-room', roomId);
        }

        const handleTranscript = ({ userName, segment }) => {
            setTranscripts((prev) => {
                let newEntry = {
                    id: Date.now() + Math.random(),
                    userName,
                    text: segment.text,
                    isPartial: segment.isPartial,
                    timestamp: segment.timestamp,
                    language: segment.language
                };
                return [...prev, newEntry];
            });
        };

        const handleAlert = ({ userName, alert }) => {
            setAlerts(prev => [...prev, { ...alert, userName }]);
        };

        const handleStatus = ({ status, reason }) => {
            if (status === 'active') setStatus('active');
            else if (status === 'error') {
                setStatus('idle');
                console.error(reason);
            }
        };

        socket.on('transcript:new', handleTranscript);
        socket.on('alert:new', handleAlert);
        socket.on('transcript:status', handleStatus);

        return () => {
            socket.off('transcript:new', handleTranscript);
            socket.off('alert:new', handleAlert);
            socket.off('transcript:status', handleStatus);
        };
    }, [socket, enabled, roomId]);

    const handleStart = async () => {
        if (!socket || !roomId) return;
        setStatus('starting');

        const userData = user ? { id: user._id, name: user.name } : { name: 'Guest' };

        try {
            console.log('Starting Sarvam transcription for room:', roomId);
            socket.emit('transcription:start', { roomId, language: 'auto', user: userData });

            await startCapture((base64Chunk) => {
                if (base64Chunk && base64Chunk.length > 0) {
                    socket.emit('transcription:audio', { chunk: base64Chunk });
                }
            });

        } catch (err) {
            console.error('Failed to start:', err);
            setStatus('idle');
        }
    };

    const handleStop = () => {
        if (!socket) return;
        setStatus('stopping');
        stopCapture();
        socket.emit('transcription:stop');
        setStatus('idle');
    };

    const generateSummary = async () => {
        setSummaryLoading(true);
        try {
            const res = await api.post(`/calls/${callId}/summarize`);
            setSummary(res.data.summary);
            setActiveTab('summary');
        } catch (e) {
            console.error('Summary failed', e);
            const msg = e.response?.data?.msg || e.message || 'Failed to generate summary';
            alert(`Error: ${msg}`);
        } finally {
            setSummaryLoading(false);
        }
    };



    return (
        <div className="bg-[#0b1120]/95 backdrop-blur-xl border-l border-gray-800 h-full flex flex-col w-96 shadow-2xl relative z-20 font-['Inter']">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-[#0b1120]/50">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                        <h4 className="font-semibold text-sm text-gray-200">Transcription</h4>
                    </div>

                    {!isCapturing ? (
                        <button
                            onClick={handleStart}
                            disabled={status === 'starting'}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            {status === 'starting' ? <Activity size={12} className="animate-spin" /> : <Mic size={12} />}
                            {status === 'starting' ? 'Connecting...' : 'Start Recording'}
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-600/30 text-xs font-medium transition-colors"
                        >
                            <MicOff size={12} />
                            Stop Recording
                        </button>
                    )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <TabButton id="transcripts" label="Live" icon={FileText} count={transcripts.length} active={activeTab === 'transcripts'} onClick={setActiveTab} />
                    <TabButton id="alerts" label="Alerts" icon={AlertTriangle} count={alerts.length} active={activeTab === 'alerts'} onClick={setActiveTab} />
                    <TabButton id="summary" label="Summary" icon={Sparkles} active={activeTab === 'summary'} onClick={setActiveTab} />
                </div>
            </div>

            {/* Content Area */}
            <div
                className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                ref={activeTab === 'transcripts' ? transcriptListRef : alertListRef}
            >
                {activeTab === 'transcripts' && (
                    transcripts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center">
                                <Mic size={24} className="opacity-50" />
                            </div>
                            <p className="text-xs text-center max-w-[200px]">
                                Start recording to see real-time transcription and diarization.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {transcripts.map((t, idx) => (
                                <div key={idx} className="group hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5">
                                    <div className="flex justify-between items-center mb-1.5 text-[11px] text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <User size={10} className="text-blue-400" />
                                            <span className="font-semibold text-blue-400/90 tracking-wide uppercase">{t.userName}</span>
                                        </div>
                                        <span className="font-mono opacity-60">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${t.isPartial ? 'text-gray-400 italic' : 'text-gray-200'}`}>
                                        {t.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'alerts' && (
                    alerts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center">
                                <CheckCircle size={24} className="opacity-50" />
                            </div>
                            <p className="text-xs">No alerts detected in this session.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {alerts.map((a, idx) => (
                                <div key={idx} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-red-500" />
                                            <span className="text-xs font-bold text-red-400">{a.userName}</span>
                                        </div>
                                        <span className="text-[10px] text-red-500/50 font-mono">{new Date(a.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-xs text-gray-400">Detected: </span>
                                        <div className="inline-flex gap-1 flex-wrap mt-1">
                                            {a.matchedWords.map((word, wIdx) => (
                                                <span key={wIdx} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-2 text-xs text-gray-300 italic">
                                        "{a.context}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'summary' && (
                    <div className="space-y-4">
                        {summary ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {summary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 mt-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Sparkles size={32} className="text-blue-400" />
                                </div>
                                <div className="text-center max-w-[240px]">
                                    <h5 className="text-gray-200 font-medium mb-1">AI Summary</h5>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Generate a concise summary of the conversation using advanced AI.
                                    </p>
                                    <button
                                        onClick={generateSummary}
                                        disabled={summaryLoading || transcripts.length === 0}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                    >
                                        {summaryLoading ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={14} />
                                                Generate Summary
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Status Bar if needed */}
            <div className="p-2 border-t border-gray-800 bg-[#0b1120]/80 text-[10px] text-gray-500 text-center">
                Powered by Zoomerrrrlive Intelligence
            </div>
        </div>
    );
};

const TabButton = ({ id, label, icon, count, active, onClick }) => {
    const Icon = icon;
    return (
        <button
            onClick={() => onClick(id)}
            className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
            ${active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
        `}
        >
            <Icon size={12} />
            <span>{label}</span>
            {count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-blue-600/30 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>
                    {count}
                </span>
            )}
        </button>
    );
};


export default TranscriptionPanel;
