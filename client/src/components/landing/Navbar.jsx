import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Sparkles, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { AuthContext } from '../../context/AuthContextDefinition';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <Motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto backdrop-blur-xl bg-[#0b1120]/60 border border-white/10 rounded-2xl shadow-lg shadow-black/20">
                <div className="flex items-center justify-between px-6 py-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Transcripter
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</a>

                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-300 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav Dropdown */}
                {isOpen && (
                    <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/10"
                    >
                        <div className="flex flex-col p-4 gap-4">
                            <a href="#features" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-white">Features</a>
                            <a href="#about" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-white">About</a>

                            {isAuthenticated ? (
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm text-blue-400 font-semibold flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-white">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="text-sm text-blue-400 font-semibold">Get Started</Link>
                                </>
                            )}
                        </div>
                    </Motion.div>
                )}
            </div>
        </Motion.nav>
    );
};

export default Navbar;
