'use client';

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
    showSkipLink?: boolean;
}

export const Header = ({ showSkipLink = false }: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="w-full bg-white/80 backdrop-blur-sm fixed top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden">
                                <img 
                                    src="/logo.jpg" 
                                    alt="Job Genie Logo" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-900">Job Genie</h1>
                        </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                            <Link href="/jobs" className="text-emerald-700 hover:text-emerald-900 transition-colors text-sm lg:text-base">Browse Jobs</Link>
                            <a href="#about" className="text-emerald-700 hover:text-emerald-900 transition-colors text-sm lg:text-base">About</a>
                            <a href="#features" className="text-emerald-700 hover:text-emerald-900 transition-colors text-sm lg:text-base">Features</a>
                            <a href="#contact" className="text-emerald-700 hover:text-emerald-900 transition-colors text-sm lg:text-base">Contact</a>
                            <Link 
                                href="/mis/login"
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm lg:text-base font-medium"
                            >
                                MIS Login
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-emerald-700 hover:bg-emerald-100 transition-colors z-50 relative"
                            aria-label="Toggle mobile menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={closeMobileMenu}
                    />
                    
                    {/* Mobile Menu */}
                    <div className="fixed inset-0 top-16 bg-white/95 backdrop-blur-md z-50 md:hidden animate-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col h-full">
                            
                            {/* Navigation Links */}
                            <nav className="flex-1 flex flex-col justify-center px-6 py-8">
                                <div className="space-y-6">
                                    <Link 
                                        href="/jobs" 
                                        className="block text-2xl font-semibold text-emerald-900 hover:text-emerald-700 transition-colors py-3 border-b border-emerald-100"
                                        onClick={closeMobileMenu}
                                    >
                                        Browse Jobs
                                    </Link>
                                    <a 
                                        href="#about" 
                                        className="block text-2xl font-semibold text-emerald-900 hover:text-emerald-700 transition-colors py-3 border-b border-emerald-100"
                                        onClick={closeMobileMenu}
                                    >
                                        About
                                    </a>
                                    <a 
                                        href="#features" 
                                        className="block text-2xl font-semibold text-emerald-900 hover:text-emerald-700 transition-colors py-3 border-b border-emerald-100"
                                        onClick={closeMobileMenu}
                                    >
                                        Features
                                    </a>
                                    <a 
                                        href="#contact" 
                                        className="block text-2xl font-semibold text-emerald-900 hover:text-emerald-700 transition-colors py-3 border-b border-emerald-100"
                                        onClick={closeMobileMenu}
                                    >
                                        Contact
                                    </a>
                                </div>
                            </nav>
                            
                            {/* Bottom section */}
                            <div className="p-6 border-t border-emerald-200">
                                <div className="text-center space-y-4">
                                    <p className="text-emerald-600 text-sm mb-4">Ready to get started?</p>
                                    <button className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                                        Upload Resume
                                    </button>
                                    <Link 
                                        href="/mis/login"
                                        onClick={closeMobileMenu}
                                        className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        MIS Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
