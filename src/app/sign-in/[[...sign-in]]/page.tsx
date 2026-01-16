"use client";

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import SocialButton from '@/components/auth/SocialButton';
import { Mail, Lock, Loader2, Chrome } from 'lucide-react';

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
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
            } else {
                console.error('Sign in incomplete:', result);
            }
        } catch (err: any) {
            console.error('Sign in error:', err);

            if (err.errors) {
                const newErrors: any = {};
                err.errors.forEach((error: any) => {
                    if (error.meta?.paramName === 'identifier') {
                        newErrors.email = error.message;
                    } else if (error.meta?.paramName === 'password') {
                        newErrors.password = error.message;
                    } else {
                        newErrors.general = error.message;
                    }
                });
                setErrors(newErrors);
            } else {
                setErrors({ general: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignIn = async (strategy: 'oauth_google' | 'oauth_github') => {
        if (!isLoaded) return;

        try {
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/',
            });
        } catch (err) {
            console.error('Social sign in error:', err);
            setErrors({ general: 'Sosyal giriş başarısız oldu. Lütfen tekrar deneyin.' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <AuthCard title="Hoş Geldiniz" subtitle="Hesabınıza giriş yapın">
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

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#15171c] px-4 text-slate-500 font-bold tracking-wider">
                                veya
                            </span>
                        </div>
                    </div>

                    {/* Social Sign In */}
                    <div className="space-y-3">
                        <SocialButton
                            provider="google"
                            icon={Chrome}
                            onClick={() => handleSocialSignIn('oauth_google')}
                        />
                    </div>

                    {/* Sign Up Link */}
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
            </AuthCard>
        </div>
    );
}
