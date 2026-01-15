import React, { useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { SocketContext } from './useSocket';

export const SocketProvider = ({ children }) => {
    // Initialize socket in useMemo to avoid side effects in render
    // or use state initialization function
    const socket = useMemo(() => {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        return io(serverUrl, {
            autoConnect: false // Don't connect immediately
        });
    }, []);

    useEffect(() => {
        socket.connect();

        // Debug connection events
        socket.on('connect', () => console.log('Socket Connected:', socket.id));
        socket.on('disconnect', () => console.log('Socket Disconnected'));
        socket.on('connect_error', (err) => console.error('Socket Connection Error:', err));

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
