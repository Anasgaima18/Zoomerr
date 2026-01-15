import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Video, Mic, Shield } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full bg-[#0b1120]">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <Motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center lg:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">Live Transcription</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                        <span className="block text-white">Capture Every</span>
                        <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Moment & Word.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Experience crystal clear video calls with real-time AI transcription.
                        Secure, scalable, and designed for the future of communication.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Link
                            to="/register"
                            className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                            <span className="flex items-center gap-2">
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>

                        <a
                            href="#demo"
                            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            View Demo
                        </a>
                    </div>

                    <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500">
                        <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-500" />
                            <span className="text-sm">HD Video</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mic className="w-5 h-5 text-purple-500" />
                            <span className="text-sm">AI Audio</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <span className="text-sm">E2E Encrypted</span>
                        </div>
                    </div>
                </Motion.div>

                {/* Hero Visual */}
                <Motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden lg:block"
                >
                    <div className="relative w-full aspect-square max-w-lg mx-auto">
                        {/* Abstract Floating Cards */}
                        <Motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-10 z-20 p-4 bg-[#1a2036]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-64"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500" />
                                <div>
                                    <div className="h-2 w-24 bg-white/20 rounded mb-1" />
                                    <div className="h-2 w-16 bg-white/10 rounded" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-white/5 rounded" />
                                <div className="h-2 w-5/6 bg-white/5 rounded" />
                                <div className="h-2 w-4/6 bg-white/5 rounded" />
                            </div>
                        </Motion.div>

                        <Motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-20 left-10 z-10 p-4 bg-[#1a2036]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-64"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-500" />
                                <div>
                                    <div className="h-2 w-20 bg-white/20 rounded mb-1" />
                                    <div className="h-2 w-12 bg-white/10 rounded" />
                                </div>
                            </div>
                            <div className="h-24 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                                <div className="flex gap-1 items-end h-8">
                                    {[1, 3, 2, 5, 3, 4, 2].map((h, i) => (
                                        <Motion.div
                                            key={i}
                                            animate={{ height: [10, h * 4, 10] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-1 bg-blue-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </Motion.div>

                        {/* Central Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-purple-600/30 rounded-full blur-[60px]" />
                        <div className="absolute inset-4 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-12 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                    </div>
                </Motion.div>
            </div>
        </section>
    );
};

export default Hero;
