import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Mic,
    Send,
    Bot,
    Smile,
    CheckCheck,
    MessageSquare,
    Loader
} from 'lucide-react';
import { io } from 'socket.io-client';
import {
    getConversations,
    getMessages,
    sendMessage,
    generateChatSummary
} from '../utils/api';
import { useAuth } from '../context/AuthContextDefinition';

const Chat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize Socket.io
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            if (activeConversation && (message.conversationId === activeConversation._id)) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
            }
            // Update last message in conversation list
            fetchConversations();
        });

        return () => socket.off('receive_message');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, activeConversation]);

    // Fetch Conversations on Mount
    useEffect(() => {
        fetchConversations(true); // Pass flag to set default
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConversations = React.useCallback(async (setDefault = false) => {
        try {
            const res = await getConversations();
            setConversations(res.data);
            if (setDefault && res.data.length > 0) {
                setActiveConversation(prev => prev || res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Messages when Active Converstation Changes
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMsgs = async () => {
            try {
                const res = await getMessages(activeConversation._id);
                setMessages(res.data);
                scrollToBottom();
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMsgs();

        // Join socket room
        if (socket) {
            socket.emit('join_room', activeConversation._id); // Ensure backend supports this if needed, or just emit to ID
        }

    }, [activeConversation, socket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async () => {
        if (!inputText.trim() || !activeConversation) return;

        try {
            const text = inputText;
            setInputText(""); // Optimistic clear

            // Optimistic update (optional, but good for UX)
            // const tempMsg = { _id: Date.now(), text, senderId: user.id, createdAt: new Date() };
            // setMessages(prev => [...prev, tempMsg]);

            await sendMessage(activeConversation._id, text);
            // Socket will receive the message back for consistency, or we can rely on optimistic
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message");
        }
    };

    const handleSummary = async () => {
        if (!activeConversation) return;
        try {
            // In a real app, show a toast or loading spinner here
            console.log("Requesting AI Summary...");
            await generateChatSummary(activeConversation._id);
        } catch (err) {
            console.error("Error generating summary:", err);
            alert("Failed to generate summary");
        }
    };

    const getOtherParticipant = (conv) => {
        return conv.participants.find(p => p._id !== user?.id) || conv.participants[0];
    };

    if (loading && !conversations.length) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0b1120] text-blue-500">
                <Loader className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0b1120] text-gray-100 font-['Inter'] overflow-hidden">
            {/* Conversations Sidebar */}
            <aside className="w-80 border-r border-gray-800 glass-panel flex-col hidden md:flex">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Messages</h2>
                        <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    {conversations.map(conv => {
                        const otherUser = getOtherParticipant(conv);
                        return (
                            <ConversationItem
                                key={conv._id}
                                name={otherUser?.name || 'Unknown User'}
                                msg={conv.lastMessage?.text || 'No messages yet'}
                                time={conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                active={activeConversation?._id === conv._id}
                                avatar={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=random`}
                                onClick={() => setActiveConversation(conv)}
                            />
                        );
                    })}
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0b1120] to-[#111827]">

                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-20 border-b border-gray-800 glass-panel flex items-center justify-between px-6 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
                                    <img
                                        src={getOtherParticipant(activeConversation)?.avatar || `https://ui-avatars.com/api/?name=${getOtherParticipant(activeConversation)?.name}&background=random`}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-bold flex items-center gap-2">
                                        {getOtherParticipant(activeConversation)?.name || 'Unknown User'}
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    </h2>
                                    <p className="text-xs text-gray-400">Online</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSummary}
                                    className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                    title="Summarize Chat"
                                >
                                    <Bot className="w-5 h-5" />
                                </button>
                                <div className="h-6 w-px bg-gray-800 mx-1"></div>
                                <button className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeConversation && messages.length === 0 && (
                                <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</div>
                            )}

                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg._id || msg.id}
                                    {...msg}
                                    isMe={msg.senderId === user?.id}
                                    senderName={msg.senderId === user?.id ? 'You' : getOtherParticipant(activeConversation)?.name}
                                    avatar={msg.senderId === user?.id ? user?.avatar : getOtherParticipant(activeConversation)?.avatar}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-800 glass-panel">
                            <div className="max-w-4xl mx-auto relative bg-gray-900/50 border border-gray-700 rounded-xl flex items-center p-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-4 text-gray-200 placeholder-gray-500"
                                />

                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    {inputText ? (
                                        <button
                                            onClick={handleSend}
                                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                                        >
                                            <Send className="w-4 h-4 ml-0.5" />
                                        </button>
                                    ) : (
                                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}

            </main>
        </div>
    );
};

// Sub-components

const ConversationItem = ({ name, msg, time, unread, active, avatar, onClick }) => (
    <div
        onClick={onClick}
        className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
        ${active ? 'bg-blue-600/10 border border-blue-600/20' : 'hover:bg-gray-800/50 border border-transparent'}
    `}>
        <div className="relative">
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
            {active && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0b1120] rounded-full"></div>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
                <h4 className={`text-sm truncate ${unread ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                    {name}
                </h4>
                <span className="text-[10px] text-gray-500">{time}</span>
            </div>
            <p className={`text-xs truncate ${unread ? 'font-semibold text-gray-200' : 'text-gray-500'}`}>
                {msg}
            </p>
        </div>
        {unread && (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {unread}
            </div>
        )}
    </div>
);

const MessageBubble = ({ text, senderName, createdAt, isMe, avatar, type }) => {
    const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'ai-summary') {
        return (
            <div className="flex justify-center">
                <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 max-w-lg flex gap-3 items-start">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-400 mb-1">AI Summary</h4>
                        <p className="text-sm text-gray-300">{text}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
            {!isMe && (
                <img src={avatar || `https://ui-avatars.com/api/?name=${senderName}&background=random`} alt={senderName} className="w-8 h-8 rounded-full object-cover mt-1" />
            )}
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div className={`
                    px-4 py-3 rounded-2xl text-sm leading-relaxed relative group
                    ${isMe
                        ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/10'
                        : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'}
                `}>
                    {text}
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[10px] text-gray-500">{time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
            </div>
        </div>
    );
};

export default Chat;
