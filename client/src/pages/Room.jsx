import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { AuthContext } from '../context/AuthContextDefinition';
import { Loader2 } from 'lucide-react';
import TranscriptionPanel from '../components/TranscriptionPanel';
import ErrorBoundary from '../components/ErrorBoundary';

const Room = () => {
    const { meetingId } = useParams();
    const { token: userToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const joinMeeting = async () => {
            try {
                // Get Token from backend
                const res = await api.get(`/meetings/join/${meetingId}`);

                setToken(res.data.token);
                // Use env var if backend doesn't send it, or use what backend sent
                setUrl(res.data.livekitUrl || import.meta.env.VITE_LIVEKIT_URL);

            } catch (err) {
                console.error(err);
                setError('Failed to join meeting');
            }
        };

        if (userToken && meetingId) {
            joinMeeting();
        }
    }, [userToken, meetingId]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-gray-100 font-['Inter']">
                <div className="glass-panel p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center max-w-md">
                    <p className="text-red-400 mb-6 text-lg">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!token || !url) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-blue-400/80 text-sm font-medium animate-pulse">Connecting to Secure Room...</p>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={url}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={() => navigate('/')}
        >
            <div className="flex h-full relative">
                <div className="flex-1">
                    <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-white">Video Grid Error - Please Refresh</div>}>
                        <VideoConference />
                    </ErrorBoundary>
                </div>
                {/* Overlay Panel or Side-by-side. Side by side pushes video, overlay sits on top.
                    Let's do Side-by-side but conditionally or just always there for demo.
                    VideoConference takes full space usually.
                    Using absolute positioning for the panel as a drawer.
                */}
                <TranscriptionPanel
                    roomId={meetingId}
                    callId={meetingId}
                    enabled={true}
                />
            </div>
        </LiveKitRoom>
    );
};

export default Room;
