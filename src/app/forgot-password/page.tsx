"use client";

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import { Mail, Lock, Loader2, Key, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Send reset code
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });
            setStep(2);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.errors?.[0]?.message || 'Kod gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                setStep(3);
                // Auto redirect after 3 seconds
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                console.error('Reset password incomplete:', result);
                setError('Şifre sıfırlama tamamlanamadı.');
            }
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.errors?.[0]?.message || 'Şifre sıfırlanırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <AuthCard
                title={step === 3 ? "Şifre Sıfırlandı" : "Şifremi Unuttum"}
                subtitle={
                    step === 1 ? "Şifrenizi sıfırlamak için e-posta adresinizi girin" :
                        step === 2 ? "E-postanıza gönderilen kodu ve yeni şifrenizi girin" :
                            "Şifreniz başarıyla güncellendi. Yönlendiriliyorsunuz..."
                }
            >
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-red-500 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <AuthInput
                            label="E-posta"
                            type="email"
                            icon={Mail}
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Gönderiliyor...
                                </>
                            ) : (
                                'Kod Gönder'
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-slate-800">
                            <Link href="/sign-in" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                                ← Giriş sayfasına dön
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-red-500 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                            <p className="text-amber-500 text-sm font-medium">
                                <strong>{email}</strong> adresine bir kod gönderdik.
                            </p>
                        </div>

                        <AuthInput
                            label="Doğrulama Kodu"
                            type="text"
                            icon={Key}
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />

                        <AuthInput
                            label="Yeni Şifre"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Şifre güncelleniyor...
                                </>
                            ) : (
                                'Şifreyi Güncelle'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-400 hover:text-white transition-colors text-sm font-medium text-center"
                        >
                            E-postayı değiştir
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <p className="text-slate-300 text-center">
                            Şifreniz başarıyla güncellendi. Şimdi ana sayfaya yönlendiriliyorsunuz.
                        </p>
                        <Link
                            href="/"
                            className="text-amber-500 hover:text-amber-400 font-bold transition-colors"
                        >
                            Beklemek istemiyorsanız tıklayın →
                        </Link>
                    </div>
                )}
            </AuthCard>
        </div>
    );
}
