import React, { useState } from 'react';
import {
    Monitor,
    MousePointer2,
    PenTool,
    Type,
    Eraser,
    Palette,
    Download,
    X,
    Maximize2,
    Users,
    MessageSquare,
    Mic,
    Video,
    StopCircle
} from 'lucide-react';

const ScreenShareOverlay = ({ isActive, onClose }) => {
    const [selectedTool, setSelectedTool] = useState('cursor');

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#0b1120] flex flex-col font-['Inter']">

            {/* Top Bar */}
            <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded bg-green-500/20 border border-green-500/30 flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400 animate-pulse">Sharing Screen</span>
                    </div>
                    <span className="text-gray-400 text-sm">|</span>
                    <span className="text-gray-300 text-sm">Chrome Tab: VS Code - Project Nexus</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex items-center gap-2">
                        <StopCircle size={18} />
                        <span className="text-sm font-medium">Stop Sharing</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">

                {/* Main Canvas Area */}
                <div className="flex-1 relative bg-gray-950 flex items-center justify-center p-8 overflow-auto">

                    {/* Mock Shared Content */}
                    <div className="w-full max-w-5xl aspect-video bg-[#1e1e1e] rounded-lg shadow-2xl border border-gray-800 relative overflow-hidden group cursor-crosshair">

                        {/* Fake Code Editor GUI */}
                        <div className="absolute top-0 left-0 right-0 h-8 bg-[#252526] flex items-center px-4 text-xs text-gray-400 select-none">
                            <span className="mr-4 text-blue-400">App.jsx</span>
                            <span className="mr-4">index.css</span>
                            <span>package.json</span>
                        </div>
                        <div className="mt-10 ml-4 font-mono text-sm text-gray-300">
                            <p><span className="text-blue-400">import</span> React <span className="text-blue-400">from</span> <span className="text-green-400">'react'</span>;</p>
                            <p className="mt-2"><span className="text-blue-400">const</span> <span className="text-yellow-300">App</span> = () {'=>'} {'{'}</p>
                            <p className="ml-4"><span className="text-purple-400">return</span> (</p>
                            <p className="ml-8 text-gray-500">{'/* TODO: Implement new UI */'}</p>
                            <p className="ml-8">{'<div className="app-container">'}</p>
                        </div>


                        {/* Remote Cursors (Mock) */}
                        <div className="absolute top-1/3 left-1/4 pointer-events-none">
                            <MousePointer2 className="w-4 h-4 text-purple-500 fill-purple-500 transform rotate-[-15deg]" />
                            <div className="ml-3 px-2 py-0.5 bg-purple-500 rounded text-[10px] font-bold text-white shadow-sm">
                                Sarah
                            </div>
                        </div>

                        {/* Annotations Layer (Mock) */}
                        <svg className="absolute inset-0 pointer-events-none">
                            <circle cx="45%" cy="30%" r="20" stroke="yellow" strokeWidth="2" fill="none" opacity="0.6" />
                            <path d="M 400 300 Q 450 350 500 300" stroke="red" strokeWidth="3" fill="none" opacity="0.8" />
                        </svg>

                    </div>

                    {/* Floating Toolbar */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl z-30">
                        <ToolButton icon={<MousePointer2 />} active={selectedTool === 'cursor'} onClick={() => setSelectedTool('cursor')} tooltip="Interact" />
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                        <ToolButton icon={<PenTool />} active={selectedTool === 'draw'} onClick={() => setSelectedTool('draw')} tooltip="Draw" />
                        <ToolButton icon={<Type />} active={selectedTool === 'text'} onClick={() => setSelectedTool('text')} tooltip="Text" />
                        <ToolButton icon={<Eraser />} active={selectedTool === 'erase'} onClick={() => setSelectedTool('erase')} tooltip="Eraser" />
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                        <button className="w-6 h-6 rounded-full bg-red-500 border-2 border-white/20 hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-white/50"></button>
                        <button className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-white/20 hover:scale-110 transition-transform"></button>
                        <button className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white/20 hover:scale-110 transition-transform"></button>
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                        <ToolButton icon={<Download />} tooltip="Save Snapshot" />
                    </div>

                </div>

                {/* Sidebar (Collapsible?) */}
                <div className="w-72 border-l border-gray-800 bg-gray-900 flex flex-col z-20">
                    <div className="p-4 border-b border-gray-800 font-semibold text-sm flex justify-between">
                        <span>Remote Control</span>
                        <span className="text-gray-500 text-xs">2 Requests</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://i.pravatar.cc/150?u=sarah" alt="" className="w-6 h-6 rounded-full" />
                                <span className="text-sm font-medium">Sarah Wilson</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Requested control of your screen.</p>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded transition-colors">Apply</button>
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-1.5 rounded transition-colors">Deny</button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-4 border-t border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">AI Live Context</span>
                        </div>
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-xs text-gray-300 leading-relaxed">
                                Currently discussing <span className="text-white font-medium">App.jsx</span> component structure. Sarah suggested refactoring the main loop.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const ToolButton = ({ icon, active, onClick, tooltip }) => (
    <button
        onClick={onClick}
        className={`
            p-2 rounded-full transition-all relative group
            ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
        `}
    >
        {React.cloneElement(icon, { size: 18 })}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {tooltip}
        </span>
    </button>
);

export default ScreenShareOverlay;
