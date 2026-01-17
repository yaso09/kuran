"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
    User, Settings as SettingsIcon, Bell, Shield, LogOut,
    ArrowLeft, Check, AlertCircle, Loader2, Save, MapPin,
    Smartphone, Moon, Globe, Mail, Plus, Trash2, Key, Lock, X, Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TURKISH_CITIES } from '@/lib/cities';
import {
    getNotificationSettings,
    saveNotificationSettings,
    requestNotificationPermission,
    scheduleDailyNotification,
    type NotificationSettings
} from '@/lib/notifications';

export default function MobileSettingsPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        city: '',
        notifications: true
    });

    const [newEmail, setNewEmail] = useState('');
    const [showAddEmail, setShowAddEmail] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        enabled: false,
        time: '20:00',
        frequency: 'daily',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            }));
            fetchProfile();
            const settings = getNotificationSettings();
            setNotificationSettings(settings);
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setFormData(prev => ({
                ...prev,
                city: data.city || '',
                notifications: data.notifications_enabled ?? true
            }));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setError('');
        try {
            await user.update({
                firstName: formData.firstName,
                lastName: formData.lastName
            });
            await supabase.from('profiles').upsert({
                id: user.id,
                city: formData.city,
                notifications_enabled: formData.notifications
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(err.message || 'Hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleAddEmail = async () => {
        if (!user || !newEmail) return;
        setSaving(true);
        try {
            await user.createEmailAddress({ email: newEmail });
            setNewEmail('');
            setShowAddEmail(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(err.message || 'E-posta eklenemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveEmail = async (emailId: string) => {
        if (!user) return;
        try {
            const email = user.emailAddresses.find(e => e.id === emailId);
            await email?.destroy();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(err.message || 'E-posta silinemedi');
        }
    };

    const handleNotificationToggle = async (enabled: boolean) => {
        if (enabled) {
            const granted = await requestNotificationPermission();
            if (!granted) return;
        }
        const newSettings = { ...notificationSettings, enabled };
        setNotificationSettings(newSettings);
        saveNotificationSettings(newSettings);
        if (enabled) scheduleDailyNotification(newSettings);
    };

    if (!isLoaded) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div></div>;

    return (
        <div className="pb-32 min-h-screen bg-[#0b0c0f]">
            {/* Header */}
            <div className="bg-[#15171c] p-6 border-b border-slate-800 mb-6 sticky top-0 z-30">
                <button onClick={() => router.back()} className="text-amber-500 flex items-center gap-1 text-xs font-black uppercase tracking-widest mb-4">
                    <ArrowLeft size={14} /> GERİ DÖN
                </button>
                <h1 className="text-2xl font-black text-white italic uppercase">AYARLAR</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">HESAP VE UYGULAMA TERCİHLERİ</p>
            </div>

            <div className="px-4 space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={18} />
                        <p className="text-red-500 text-xs font-bold uppercase">{error}</p>
                    </div>
                )}

                {/* Profile Section */}
                <div className="bg-[#15171c] rounded-[2rem] border border-slate-800 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-800/50 pb-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/20">
                                <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-white font-black italic uppercase">{user?.fullName}</p>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">ÜYELİK: {new Date(user?.createdAt || '').toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white font-black uppercase italic text-xs tracking-widest flex items-center gap-2">
                                <User size={14} className="text-amber-500" /> KİŞİSEL BİLGİLER
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="Ad"
                                    className="bg-[#0b0c0f] border border-slate-800 rounded-2xl p-4 text-xs text-white focus:border-amber-500 outline-none font-bold"
                                />
                                <input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Soyad"
                                    className="bg-[#0b0c0f] border border-slate-800 rounded-2xl p-4 text-xs text-white focus:border-amber-500 outline-none font-bold"
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <select
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-[#0b0c0f] border border-slate-800 rounded-2xl p-4 pl-12 text-xs text-white focus:border-amber-500 outline-none font-bold appearance-none"
                                >
                                    <option value="">Şehir Seçin</option>
                                    {TURKISH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-amber-600 text-white font-black uppercase italic py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : success ? <Check size={18} /> : "PROFİLİ GÜNCELLE"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Email Section */}
                <div className="bg-[#15171c] rounded-[2rem] border border-slate-800 p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-black uppercase italic text-xs tracking-widest flex items-center gap-2">
                            <Mail size={14} className="text-blue-500" /> E-POSTA ADRESLERİ
                        </h3>
                        <button onClick={() => setShowAddEmail(!showAddEmail)} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white active:scale-90 transition-transform">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {user?.emailAddresses.map(email => (
                            <div key={email.id} className="bg-[#0b0c0f] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-white font-bold">{email.emailAddress}</span>
                                    {email.id === user.primaryEmailAddressId && <span className="text-[8px] text-amber-500 font-black uppercase">Birincil</span>}
                                </div>
                                {user.emailAddresses.length > 1 && email.id !== user.primaryEmailAddressId && (
                                    <button onClick={() => handleRemoveEmail(email.id)} className="text-red-500 p-2"><Trash2 size={16} /></button>
                                )}
                            </div>
                        ))}
                    </div>

                    {showAddEmail && (
                        <div className="pt-4 border-t border-slate-800/50 flex gap-2">
                            <input
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="yeni@email.com"
                                className="flex-1 bg-[#0b0c0f] border border-slate-800 rounded-xl p-3 text-xs text-white outline-none font-bold"
                            />
                            <button onClick={handleAddEmail} className="bg-blue-600 text-white px-4 rounded-xl text-xs font-black uppercase italic">EKLE</button>
                        </div>
                    )}
                </div>

                {/* Notifications Section */}
                <div className="bg-[#15171c] rounded-[2rem] border border-slate-800 p-6 space-y-4">
                    <h3 className="text-white font-black uppercase italic text-xs tracking-widest flex items-center gap-2">
                        <Bell size={14} className="text-purple-500" /> BİLDİRİMLER
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-[#0b0c0f] p-4 rounded-2xl border border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white uppercase tracking-tighter">GÜNLÜK HATIRLATICI</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">OKUMA MOTİVASYONU</span>
                            </div>
                            <button
                                onClick={() => handleNotificationToggle(!notificationSettings.enabled)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${notificationSettings.enabled ? "bg-amber-600" : "bg-slate-700"}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationSettings.enabled ? "left-6" : "left-1"}`} />
                            </button>
                        </div>

                        {notificationSettings.enabled && (
                            <div className="flex items-center gap-3 bg-[#0b0c0f] p-4 rounded-2xl border border-slate-800">
                                <Clock size={16} className="text-slate-500" />
                                <input
                                    type="time"
                                    value={notificationSettings.time}
                                    onChange={(e) => {
                                        const newS = { ...notificationSettings, time: e.target.value };
                                        setNotificationSettings(newS);
                                        saveNotificationSettings(newS);
                                        scheduleDailyNotification(newS);
                                    }}
                                    className="bg-transparent text-white font-black italic outline-none flex-1 text-sm appearance-none"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-3">
                    <button onClick={() => signOut(() => router.push('/'))} className="w-full bg-red-600/10 text-red-500 font-black uppercase italic p-5 rounded-3xl border border-red-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <LogOut size={18} /> GÜVENLİ ÇIKIŞ
                    </button>
                    <p className="text-[9px] text-slate-600 font-black text-center uppercase tracking-[0.2em] px-10 leading-relaxed">
                        Üyelik silme ve gelişmiş güvenlik işlemleri için lütfen masaüstü sürümünü ziyaret edin.
                    </p>
                </div>
            </div>
        </div>
    );
}
