"use client";

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [strategy, setStrategy] = useState<'totp' | 'email_code'>('totp');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string; code?: string }>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setErrors({});
        setLoading(true);

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.push('/');
            } else if (result.status === 'needs_second_factor') {
                // Find supported strategies
                const supportedStrategies = result.supportedSecondFactors?.map(f => f.strategy) || [];

                if (supportedStrategies.includes('email_code')) {
                    setStrategy('email_code');
                    await signIn.prepareSecondFactor({ strategy: 'email_code' });
                } else if (supportedStrategies.includes('totp')) {
                    setStrategy('totp');
                }

                setShow2FA(true);
            } else if (result.status === 'needs_first_factor') {
                setErrors({ general: 'Ek doğrulama gerekiyor. Lütfen e-postanızı kontrol edin.' });
            } else {
                console.error('Sign in status:', result.status);
                setErrors({ general: `Giriş tamamlanamadı: ${result.status}` });
            }
        } catch (err: any) {
            console.error('Sign in error:', err);

            if (err.errors) {
                const newErrors: any = {};
                err.errors.forEach((error: any) => {
                    const field = error.meta?.paramName;
                    if (field === 'identifier' || field === 'email_address') {
                        newErrors.email = error.message;
                    } else if (field === 'password') {
                        newErrors.password = error.message;
                    } else if (error.code === 'form_identifier_not_found') {
                        newErrors.email = 'Hesap bulunamadı.';
                    } else if (error.code === 'form_password_incorrect') {
                        newErrors.password = 'Şifre hatalı.';
                    } else {
                        newErrors.general = error.message;
                    }
                });
                setErrors(newErrors);
            } else {
                setErrors({ general: 'Giriş yapılırken beklenmedik bir hata oluştu.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSecondFactor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setErrors({});
        setLoading(true);

        try {
            const result = await signIn.attemptSecondFactor({
                strategy,
                code,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.push('/');
            } else {
                setErrors({ code: 'Doğrulama kodu geçersiz.' });
            }
        } catch (err: any) {
            console.error('2FA error:', err);
            setErrors({ code: err.errors?.[0]?.message || 'Doğrulama başarısız oldu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!isLoaded || strategy !== 'email_code') return;
        setLoading(true);
        try {
            await signIn.prepareSecondFactor({ strategy: 'email_code' });
        } catch (err: any) {
            console.error('Resend error:', err);
            setErrors({ code: 'Kod yeniden gönderilemedi.' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <AuthCard
                title={show2FA ? "İki Faktörlü Doğrulama" : "Hoş Geldiniz"}
                subtitle={show2FA ? "Uygulamanızdaki 6 haneli kodu girin" : "Hesabınıza giriş yapın"}
            >
                {!show2FA ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-red-500 text-sm font-medium">{errors.general}</p>
                            </div>
                        )}

                        {/* Email Input */}
                        <AuthInput
                            label="E-posta"
                            type="email"
                            icon={Mail}
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />

                        {/* Password Input */}
                        <AuthInput
                            label="Şifre"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                    Beni hatırla
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                            >
                                Şifremi unuttum
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-slate-800">
                            <p className="text-slate-400 text-sm">
                                Hesabınız yok mu?{' '}
                                <Link
                                    href="/sign-up"
                                    className="text-amber-500 hover:text-amber-400 font-bold transition-colors"
                                >
                                    Kayıt olun
                                </Link>
                            </p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSecondFactor} className="space-y-6">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                            <p className="text-amber-500 text-sm font-medium">
                                {strategy === 'email_code'
                                    ? `Hesabınızda İki Faktörlü Doğrulama aktif. ${email} adresine bir kod gönderdik.`
                                    : "Hesabınızda İki Faktörlü Doğrulama aktif. Uygulamanızdaki kodu girin."}
                            </p>
                        </div>

                        <AuthInput
                            label="Doğrulama Kodu"
                            type="text"
                            placeholder="000 000"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            error={errors.code}
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
                                    Doğrulanıyor...
                                </>
                            ) : (
                                'Doğrula ve Giriş Yap'
                            )}
                        </button>

                        {strategy === 'email_code' && (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="w-full text-amber-500 hover:text-amber-400 transition-colors text-sm font-medium text-center"
                            >
                                Kodu tekrar gönder
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShow2FA(false)}
                            className="w-full text-slate-400 hover:text-white transition-colors text-sm font-medium text-center"
                        >
                            ← Geri dön
                        </button>
                    </form>
                )}
            </AuthCard>
        </div>
    );
}
