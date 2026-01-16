"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileDropdown() {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700 hover:border-amber-500 transition-colors">
                    {user.imageUrl ? (
                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                            <User className="text-white" size={20} />
                        </div>
                    )}
                </div>
                <ChevronDown
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    size={16}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#15171c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-800">
                        <p className="text-white font-bold truncate">{user.fullName || 'İsimsiz Kullanıcı'}</p>
                        <p className="text-slate-500 text-sm truncate">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href="/ayarlar"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-amber-500 transition-colors"
                        >
                            <Settings size={18} />
                            <span className="font-medium">Hesap Ayarları</span>
                        </Link>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Clerk's sign out will be handled by the settings page
                                window.location.href = '/sign-in';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
