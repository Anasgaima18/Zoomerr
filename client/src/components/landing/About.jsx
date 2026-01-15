import React from 'react';
import { motion as Motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-24 px-6 bg-[#0b1120] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <Motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                            Revolutionizing Remote Work
                        </span>
                    </h2>
                    <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                        In a world where communication happens everywhere, Zoomerrrrlive brings clarity.
                        We combine state-of-the-art video compression with military-grade encryption
                        and AI-driven transcription to create the ultimate meeting experience.
                    </p>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                        Whether you are a startup pitching to investors, or a large enterprise managing
                        global teams, our platform scales to your needs instantly.
                    </p>

                    <div className="space-y-4">
                        {[
                            "99.9% Uptime SLA",
                            "GDPR & HIPAA Compliant",
                            "Low Latency (<30ms)",
                            "Interactive AI Summaries"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </Motion.div>

                <Motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#111827]">
                        {/* Placeholder for About Image/Graphic */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-8">
                            <div className="w-full h-full bg-[#0b1120] rounded-xl border border-white/5 relative p-6">
                                {/* Abstract UI mockup */}
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20" />
                                        <div className="w-32 h-3 bg-white/10 rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/5" />
                                        <div className="w-8 h-8 rounded-full bg-white/5" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 h-40">
                                    <div className="col-span-2 bg-white/5 rounded-lg border border-white/5 p-4">
                                        <div className="w-1/2 h-2 bg-white/10 rounded mb-2" />
                                        <div className="w-3/4 h-2 bg-white/10 rounded" />
                                    </div>
                                    <div className="bg-blue-500/10 rounded-lg border border-blue-500/20" />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <div className="w-full h-2 bg-white/5 rounded" />
                                    <div className="w-12 h-2 bg-blue-500/50 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Motion.div>
            </div>
        </section>
    );
};

export default About;
