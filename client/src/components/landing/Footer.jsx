import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-[#0b1120] pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white mb-6 block">
                            Transcripter
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            Building the future of communication with AI-powered insights and crystal clear video everywhere.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><a href="#features" className="text-gray-400 hover:text-blue-400 transition-colors">Features</a></li>
                            <li><a href="#demo" className="text-gray-400 hover:text-blue-400 transition-colors">Demo</a></li>
                            <li><Link to="/register" className="text-gray-400 hover:text-blue-400 transition-colors">Pricing</Link></li>
                            <li><a href="https://github.com/Zoomerrrrlive/transcripter" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors">About</a></li>
                            <li><Link to="#" className="text-gray-400 hover:text-blue-400 transition-colors">Blog</Link></li>
                            <li><Link to="#" className="text-gray-400 hover:text-blue-400 transition-colors">Careers</Link></li>
                            <li><a href="mailto:contact@transcripter.app" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-gray-500 text-sm">
                        © 2026 Zoomerrrrlive. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
