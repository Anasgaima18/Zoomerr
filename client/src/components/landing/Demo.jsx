import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Play } from 'lucide-react';

const Demo = () => {
    return (
        <section id="demo" className="py-24 px-6 relative">
            <div className="max-w-5xl mx-auto text-center">
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">
                        <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                            See It In Action
                        </span>
                    </h2>

                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#111827] border border-white/10 shadow-2xl group cursor-pointer" onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}>
                        {/* Placeholder for Video/Demo */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-left">
                            <h3 className="text-xl font-bold text-white mb-2">Live Demo Walkthrough</h3>
                            <p className="text-gray-300">Watch how Transcripter handles real-time speech processing.</p>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </section>
    );
};

export default Demo;
