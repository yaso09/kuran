"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { usePageTracking } from '@/hooks/usePageTracking';
import {
    getNotificationSettings,
    saveNotificationSettings,
    requestNotificationPermission,
    scheduleDailyNotification,
    registerPushSubscription,
    type NotificationSettings,
} from '@/lib/notifications';
import {
    hasAnalyticsConsent,
    setAnalyticsConsent,
} from '@/lib/analytics';
import { TURKISH_CITIES } from '@/lib/cities';
import { supabase } from '@/lib/supabase';
import {
    MapPin,
    Sunrise,
} from 'lucide-react';
import {
    User,
    Mail,
    Shield,
    Bell,
    Smartphone,
    Key,
    Trash2,
    LogOut,
    Save,
    Loader2,
    Check,
    Settings as SettingsIcon,
    Lock,
    Plus,
    X,
    AlertCircle,
    Clock,
} from 'lucide-react';

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { signOut, session: currentSession } = useClerk();
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');

    // Track page visit
    usePageTracking('/ayarlar', 'Ayarlar');

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        city: '',
        namazNotifications: false,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('city, notifications_enabled')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    city: profile.city || '',
                    namazNotifications: profile.notifications_enabled || false
                }));
            }
        };
        fetchProfile();
    }, [user]);

    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [showAddEmail, setShowAddEmail] = useState(false);
    const [showAddPhone, setShowAddPhone] = useState(false);

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        enabled: false,
        time: '20:00',
        frequency: 'daily',
    });

    useEffect(() => {
        // Load notification settings on mount
        const settings = getNotificationSettings();
        setNotificationSettings(settings);
    }, []);

    const handleNotificationToggle = async (enabled: boolean) => {
        if (enabled) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                alert('Bildirim izni verilmedi. Lütfen tarayıcı ayarlarından bildirimleri etkinleştirin.');
                return;
            }
        }

        const newSettings = { ...notificationSettings, enabled };
        setNotificationSettings(newSettings);
        saveNotificationSettings(newSettings);

        if (enabled) {
            scheduleDailyNotification(newSettings);
        }
    };

    const handleNotificationTimeChange = (time: string) => {
        const newSettings = { ...notificationSettings, time };
        setNotificationSettings(newSettings);
        saveNotificationSettings(newSettings);

        if (notificationSettings.enabled) {
            scheduleDailyNotification(newSettings);
        }
    };

    // Analytics consent
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

    useEffect(() => {
        setAnalyticsEnabled(hasAnalyticsConsent());
    }, []);

    const handleAnalyticsToggle = (enabled: boolean) => {
        setAnalyticsEnabled(enabled);
        setAnalyticsConsent(enabled);
    };

    const handleNamazNotificationToggle = async (enabled: boolean) => {
        setFormData(prev => ({ ...prev, namazNotifications: enabled }));

        if (!user) return;

        // Optimistically update UI
        try {
            // Request permission if enabling
            if (enabled) {
                const granted = await requestNotificationPermission();
                if (!granted) {
                    alert('Bildirim izni verilmedi. Lütfen tarayıcı ayarlarından bildirimleri etkinleştirin.');
                    setFormData(prev => ({ ...prev, namazNotifications: false }));
                    return;
                }
                // Also trigger push subscription
                await registerPushSubscription(user.id);
            }

            // Use upsert instead of update to handle missing profile rows
            await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    notifications_enabled: enabled,
                    city: formData.city || 'Istanbul' // Default if missing
                });

        } catch (err: any) {
            console.error('Error saving notification setting:', err);
            // Revert on error
            setFormData(prev => ({ ...prev, namazNotifications: !enabled }));
            setError(`Hata: ${err.message || 'Bilinmeyen hata'} (${err.code || 'NoCode'})`);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setError('');
        try {
            await user.update({
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            // Update Supabase profile
            await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    city: formData.city,
                    notifications_enabled: formData.namazNotifications
                });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError('Profil güncellenirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddEmail = async () => {
        if (!user || !newEmail) return;

        setSaving(true);
        setError('');
        try {
            await user.createEmailAddress({ email: newEmail });
            setNewEmail('');
            setShowAddEmail(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error adding email:', err);
            setError('E-posta eklenirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveEmail = async (emailId: string) => {
        if (!user || !confirm('Bu e-posta adresini kaldırmak istediğinize emin misiniz?')) return;

        try {
            const emailAddress = user.emailAddresses.find(e => e.id === emailId);
            await emailAddress?.destroy();
        } catch (err: any) {
            console.error('Error removing email:', err);
            setError('E-posta kaldırılırken bir hata oluştu.');
        }
    };

    const handleSetPrimaryEmail = async (emailId: string) => {
        if (!user) return;

        try {
            await user.update({
                primaryEmailAddressId: emailId,
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error setting primary email:', err);
            setError('Birincil e-posta ayarlanırken bir hata oluştu.');
        }
    };

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = async () => {
        if (!user) return;

        setPasswordError('');

        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Lütfen tüm alanları doldurun.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Yeni şifreler eşleşmiyor.');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('Şifre en az 8 karakter olmalıdır.');
            return;
        }

        setSaving(true);
        try {
            await user.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error changing password:', err);
            setPasswordError(err.errors?.[0]?.message || 'Şifre değiştirilirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    // Active sessions
    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);

    const loadSessions = async () => {
        if (!user) return;

        try {
            const sessionList = await user.getSessions();
            setSessions(sessionList);
        } catch (err) {
            console.error('Error loading sessions:', err);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Bu oturumu sonlandırmak istediğinize emin misiniz?')) return;

        try {
            const session = sessions.find(s => s.id === sessionId);
            await session?.revoke();
            await loadSessions();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error revoking session:', err);
            setError('Oturum sonlandırılırken bir hata oluştu.');
        }
    };

    const handleSignOut = async () => {
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            await signOut();
            router.push('/sign-in');
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
            if (confirm('Son kez soruyoruz: Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?')) {
                try {
                    await user?.delete();
                    router.push('/');
                } catch (err: any) {
                    console.error('Error deleting account:', err);
                    setError('Hesap silinirken bir hata oluştu.');
                }
            }
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        );
    }

    if (!user) {
        router.push('/sign-in');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0b0c0f]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-2xl">
                            <SettingsIcon className="text-amber-500" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Hesap Ayarları</h1>
                            <p className="text-slate-400">Profilinizi ve güvenlik ayarlarınızı yönetin</p>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                        <Check className="text-green-500" size={20} />
                        <p className="text-green-500 font-medium">Değişiklikler kaydedildi!</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-500 font-medium text-sm">
                            {error}
                        </p>
                        <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-400">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Profile Section */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-amber-500" size={20} />
                            <h2 className="text-xl font-black text-white">Profil Bilgileri</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Profile Picture */}
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-800">
                                    {user.imageUrl ? (
                                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                                            <User className="text-white" size={32} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{user.fullName || 'İsimsiz Kullanıcı'}</p>
                                    <p className="text-slate-500 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                                    <p className="text-slate-600 text-xs mt-1">Üyelik: {new Date(user.createdAt!).toLocaleDateString('tr-TR')}</p>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Ad
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-[#0b0c0f] border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Soyad
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-[#0b0c0f] border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Değişiklikleri Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Email Addresses Section */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Mail className="text-blue-500" size={20} />
                                <h2 className="text-xl font-black text-white">E-posta Adresleri</h2>
                            </div>
                            <button
                                onClick={() => setShowAddEmail(!showAddEmail)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
                            >
                                <Plus size={16} />
                                Ekle
                            </button>
                        </div>

                        <div className="space-y-3">
                            {user.emailAddresses.map((email) => (
                                <div key={email.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-slate-500" size={18} />
                                        <div>
                                            <p className="text-white font-medium">{email.emailAddress}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {email.id === user.primaryEmailAddressId && (
                                                    <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold">
                                                        Birincil
                                                    </span>
                                                )}
                                                {email.verification?.status === 'verified' ? (
                                                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        <Check size={12} />
                                                        Doğrulandı
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold">
                                                        Doğrulanmadı
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {email.id !== user.primaryEmailAddressId && (
                                            <>
                                                <button
                                                    onClick={() => handleSetPrimaryEmail(email.id)}
                                                    className="text-xs text-amber-500 hover:text-amber-400 font-bold transition-colors"
                                                >
                                                    Birincil Yap
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveEmail(email.id)}
                                                    className="text-red-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add Email Form */}
                            {showAddEmail && (
                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="yeni@email.com"
                                            className="flex-1 bg-[#0b0c0f] border border-slate-800 rounded-lg py-2 px-4 text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        />
                                        <button
                                            onClick={handleAddEmail}
                                            disabled={saving || !newEmail}
                                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Ekle
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowAddEmail(false);
                                                setNewEmail('');
                                            }}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-purple-500" size={20} />
                            <h2 className="text-xl font-black text-white">Güvenlik</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Lock className="text-slate-500" size={18} />
                                    <div>
                                        <p className="text-white font-bold">Şifre</p>
                                        <p className="text-slate-500 text-sm">Son değiştirilme: {user.passwordEnabled ? 'Ayarlandı' : 'Ayarlanmadı'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="text-amber-500 hover:text-amber-400 font-bold text-sm transition-colors"
                                >
                                    Değiştir →
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="text-slate-500" size={18} />
                                    <div>
                                        <p className="text-white font-bold">İki Faktörlü Doğrulama (2FA)</p>
                                        <p className="text-slate-500 text-sm">Hesabınızı ekstra koruyun</p>
                                    </div>
                                </div>
                                <button className="text-slate-500 hover:text-white font-bold text-sm transition-colors">
                                    Yakında
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Key className="text-slate-500" size={18} />
                                    <div>
                                        <p className="text-white font-bold">Aktif Oturumlar</p>
                                        <p className="text-slate-500 text-sm">Diğer cihazlardaki oturumları yönetin</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowSessionsModal(true);
                                        loadSessions();
                                    }}
                                    className="text-amber-500 hover:text-amber-400 font-bold text-sm transition-colors"
                                >
                                    Görüntüle →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Bell className="text-green-500" size={20} />
                                <h2 className="text-xl font-black text-white">Bildirimler</h2>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!window.confirm("Test bildirimi gönderilsin mi?")) return;
                                    try {
                                        const res = await fetch('/api/notifications/send', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                userId: user.id,
                                                title: "🔔 Test Bildirimi",
                                                body: "Bildirim sisteminiz başarıyla çalışıyor! Elhamdülillah.",
                                                url: "/ayarlar"
                                            })
                                        });
                                        if (res.ok) alert("Bildirim gönderildi!");
                                        else alert("Bildirim gönderilemedi. Hata kodu: " + res.status);
                                    } catch (e) {
                                        alert("Bir hata oluştu.");
                                        console.error(e);
                                    }
                                }}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-bold transition-colors border border-slate-700"
                            >
                                🔔 Test Bildirimi Gönder
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Daily Reading Reminders */}
                            <div className="p-4 bg-slate-800/30 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-bold">Günlük Okuma Hatırlatmaları</p>
                                        <p className="text-slate-500 text-sm">Her gün belirlediğiniz saatte hatırlatma alın</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={notificationSettings.enabled}
                                            onChange={(e) => handleNotificationToggle(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                {/* Time Picker */}
                                {notificationSettings.enabled && (
                                    <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                                        <Clock className="text-slate-500" size={18} />
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Hatırlatma Saati
                                            </label>
                                            <input
                                                type="time"
                                                value={notificationSettings.time}
                                                onChange={(e) => handleNotificationTimeChange(e.target.value)}
                                                className="bg-[#0b0c0f] border border-slate-800 rounded-lg py-2 px-4 text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Email Notifications */}
                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                                <div>
                                    <p className="text-white font-bold">E-posta Bildirimleri</p>
                                    <p className="text-slate-500 text-sm">Önemli güncellemeler için e-posta alın</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>

                            {/* Namaz Vakitleri Bildirimleri */}
                            <div className="p-4 bg-slate-800/30 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded-lg">
                                            <Sunrise className="text-amber-500" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Namaz Vakti Bildirimleri</p>
                                            <p className="text-slate-500 text-sm">Vakitlerde ve 45 dk kala bildirim al</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.namazNotifications}
                                            onChange={(e) => handleNamazNotificationToggle(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                {formData.namazNotifications && (
                                    <div className="flex flex-col gap-4 pt-3 border-t border-slate-700">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                <MapPin size={12} />
                                                Şehir Seçimi
                                            </label>
                                            <select
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-[#0b0c0f] border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Şehir Seçin</option>
                                                {TURKISH_CITIES.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Section */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-[#15171c] rounded-xl p-6 border border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-blue-500" size={20} />
                            <h2 className="text-xl font-black text-white">Gizlilik ve Veri</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                                <div>
                                    <p className="text-white font-bold">Analitik Veri Toplama</p>
                                    <p className="text-slate-500 text-sm">Platformu geliştirmemize yardımcı olmak için anonim kullanım verilerini paylaşın</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={analyticsEnabled}
                                        onChange={(e) => handleAnalyticsToggle(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-20"></div>
                    <div className="relative bg-[#15171c] rounded-xl p-6 border border-red-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <Trash2 className="text-red-500" size={20} />
                            <h2 className="text-xl font-black text-white">Tehlikeli Bölge</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                <div>
                                    <p className="text-white font-bold">Çıkış Yap</p>
                                    <p className="text-slate-500 text-sm">Hesabınızdan çıkış yapın</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
                                >
                                    <LogOut size={16} />
                                    Çıkış Yap
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                <div>
                                    <p className="text-red-500 font-bold">Hesabı Sil</p>
                                    <p className="text-slate-500 text-sm">Hesabınızı ve tüm verilerinizi kalıcı olarak silin</p>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Hesabı Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#15171c] rounded-2xl border border-slate-800 p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white">Şifre Değiştir</h3>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    setPasswordError('');
                                }}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                                <AlertCircle className="text-red-500" size={18} />
                                <p className="text-red-500 text-sm font-medium">{passwordError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    Mevcut Şifre
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full bg-[#0b0c0f] border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    Yeni Şifre
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full bg-[#0b0c0f] border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    Yeni Şifre (Tekrar)
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full bg-[#0b0c0f] border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            <button
                                onClick={handlePasswordChange}
                                disabled={saving}
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Şifreyi Değiştir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Sessions Modal */}
            {showSessionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#15171c] rounded-2xl border border-slate-800 p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white">Aktif Oturumlar</h3>
                            <button
                                onClick={() => setShowSessionsModal(false)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {sessions.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">Oturum bilgisi yükleniyor...</p>
                            ) : (
                                sessions.map((session) => (
                                    <div key={session.id} className="p-4 bg-slate-800/30 rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-white font-bold">
                                                        {session.latestActivity?.deviceType || 'Bilinmeyen Cihaz'}
                                                    </p>
                                                    {session.id === currentSession?.id && (
                                                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-sm">
                                                    {session.latestActivity?.browserName || 'Bilinmeyen Tarayıcı'} • {' '}
                                                    {session.latestActivity?.city || 'Bilinmeyen Konum'}
                                                </p>
                                                <p className="text-slate-600 text-xs mt-1">
                                                    Son aktivite: {new Date(session.lastActiveAt).toLocaleString('tr-TR')}
                                                </p>
                                            </div>
                                            {session.id !== currentSession?.id && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="text-red-500 hover:text-red-400 transition-colors ml-4"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
