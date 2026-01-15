import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Mic, Video, Globe, Zap, Lock, BarChart3 } from 'lucide-react';

const FEATURE_LIST = [
    {
        icon: Mic,
        title: "Real-time Transcription",
        description: "Advanced AI that transcribes speech to text instantly with 99% accuracy.",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Video,
        title: "HD Video Calls",
        description: "Crystal clear 4K video quality optimized for low bandwidth connections.",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: Globe,
        title: "Global Connectivity",
        description: "Low latency servers distributed worldwide for seamless communication.",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: Zap,
        title: "Instant Setup",
        description: "Create a room and share the link. No downloads required for your guests.",
        color: "from-orange-500 to-yellow-500"
    },
    {
        icon: Lock,
        title: "End-to-End Encryption",
        description: "Your conversations are private and secure with military-grade encryption.",
        color: "from-red-500 to-rose-500"
    },
    {
        icon: BarChart3,
        title: "Meeting Analytics",
        description: "Get insights on participation, talk time, and sentiment analysis.",
        color: "from-indigo-500 to-violet-500"
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                            Powerhouse Features
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Everything you need to conduct professional meetings, interviews, and webinars.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURE_LIST.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ feature, index }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative p-8 rounded-3xl bg-[#111827]/50 border border-white/5 overflow-hidden hover:bg-[#1f2937]/50 transition-colors"
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="mb-6 inline-flex p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-8 h-8 text-white`} />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {feature.description}
            </p>
        </Motion.div>
    );
};

export default Features;
