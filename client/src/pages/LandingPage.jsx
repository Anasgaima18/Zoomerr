import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import About from '../components/landing/About';
import Demo from '../components/landing/Demo';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#0b1120] text-white selection:bg-blue-500/30 scroll-smooth">
            <Navbar />
            <Hero />
            <Features />
            <Demo />
            <About />
            <Footer />
        </div>
    );
};

export default LandingPage;
