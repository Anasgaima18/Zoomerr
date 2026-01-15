import React, { useState } from 'react';
import {
    X,
    Users,
    Plus,
    Trash2,
    Move,
    LogOut,
    Settings,
    MoreVertical,
    Check
} from 'lucide-react';

const BreakoutRoomsModal = ({ isOpen, onClose }) => {
    const [rooms] = useState([
        { id: 1, name: 'Room Alpha', participants: ['Sarah Wilson', 'Mike Johnson'] },
        { id: 2, name: 'Room Beta', participants: ['David Lee'] },
    ]);
    const [mainRoom] = useState(['You', 'Jessica Chen', 'Tom Cook']);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-[#0b1120] border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-['Inter']">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Breakout Rooms</h2>
                            <p className="text-xs text-gray-400">Manage participant distribution</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition-colors flex items-center gap-2">
                            <Settings size={14} />
                            Options
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 overflow-auto p-6 bg-[#0b1120]">
                    <div className="flex gap-6 h-full">

                        {/* Main Room List */}
                        <div className="w-1/3 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Main Session</h3>
                                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{mainRoom.length}</span>
                            </div>

                            <div className="flex-1 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 p-3 space-y-2 overflow-y-auto">
                                {mainRoom.map((user, i) => (
                                    <ParticipantCard key={i} name={user} isMe={user === 'You'} />
                                ))}
                            </div>
                        </div>

                        {/* Breakout Rooms Grid */}
                        <div className="flex-1 bg-gray-900/20 rounded-xl p-4 border border-gray-800 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Rooms</h3>
                                <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                                    <Plus size={16} /> Create Room
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rooms.map((room) => (
                                    <div key={room.id} className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4 flex flex-col group hover:border-blue-500/30 transition-colors relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <h4 className="font-semibold text-gray-200">{room.name}</h4>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                                                    <MoreVertical size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2 min-h-[80px]">
                                            {room.participants.length > 0 ? (
                                                room.participants.map((p, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded bg-gray-700/30 text-xs text-gray-300">
                                                        <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-bold">
                                                            {p.charAt(0)}
                                                        </div>
                                                        {p}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-600 text-xs">
                                                    <p>Drop participants here</p>
                                                </div>
                                            )}
                                        </div>

                                        <button className="mt-3 w-full py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded transition-colors">
                                            Join Room
                                        </button>
                                    </div>
                                ))}

                                {/* Add New Room Placeholder */}
                                <div className="border border-dashed border-gray-800 rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-gray-800/30 transition-colors text-gray-500 hover:text-gray-300">
                                    <div className="flex flex-col items-center gap-2">
                                        <Plus size={24} />
                                        <span className="text-sm font-medium">Add Room</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        Drag and drop participants to move them between rooms.
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors text-sm">
                            Cancel
                        </button>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all text-sm flex items-center gap-2">
                            <Check size={16} />
                            Start Sessions
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

const ParticipantCard = ({ name, isMe }) => (
    <div className={`
        flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700
        ${isMe ? 'bg-blue-900/10 border-blue-900/20' : ''}
    `}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate flex items-center gap-2">
                {name}
                {isMe && <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 rounded font-bold">YOU</span>}
            </p>
        </div>
        <Move size={14} className="text-gray-600" />
    </div>
);

export default BreakoutRoomsModal;
