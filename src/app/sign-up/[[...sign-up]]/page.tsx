"use client";

import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import SocialButton from '@/components/auth/SocialButton';
import { Mail, Lock, User, Loader2, Chrome, Check, X } from 'lucide-react';

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthLabels = ['Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Ad gereklidir';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Şifre en az 8 karakter olmalıdır';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !validateForm()) return;

        setLoading(true);

        try {
            await signUp.create({
                firstName: formData.firstName,
                lastName: formData.lastName,
                emailAddress: formData.email,
                password: formData.password,
            });

            // Send email verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            console.error('Sign up error:', err);

            if (err.errors) {
                const newErrors: any = {};
                err.errors.forEach((error: any) => {
                    const field = error.meta?.paramName || 'general';
                    newErrors[field] = error.message;
                });
                setErrors(newErrors);
            } else {
                setErrors({ general: 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.push('/');
            } else {
                console.error('Verification incomplete:', completeSignUp);
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            setErrors({ code: 'Doğrulama kodu geçersiz. Lütfen tekrar deneyin.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = async (strategy: 'oauth_google' | 'oauth_github') => {
        if (!isLoaded) return;

        try {
            await signUp.authenticateWithRedirect({
                strategy,
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/',
            });
        } catch (err) {
            console.error('Social sign up error:', err);
            setErrors({ general: 'Sosyal kayıt başarısız oldu. Lütfen tekrar deneyin.' });
        }
    };

    if (pendingVerification) {
        return (
            <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
                <AuthCard title="E-posta Doğrulama" subtitle="Size gönderilen kodu girin">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                            <p className="text-amber-500 text-sm font-medium">
                                <strong>{formData.email}</strong> adresine bir doğrulama kodu gönderdik.
                            </p>
                        </div>

                        <AuthInput
                            label="Doğrulama Kodu"
                            type="text"
                            placeholder="123456"
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
                                'Doğrula'
                            )}
                        </button>
                    </form>
                </AuthCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center p-4 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <AuthCard title="Hesap Oluştur" subtitle="Kur'ancılar'a katılın">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <p className="text-red-500 text-sm font-medium">{errors.general}</p>
                        </div>
                    )}

                    {/* Name Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <AuthInput
                            label="Ad"
                            type="text"
                            name="firstName"
                            icon={User}
                            placeholder="Adınız"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            required
                        />
                        <AuthInput
                            label="Soyad"
                            type="text"
                            name="lastName"
                            placeholder="Soyadınız"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email Input */}
                    <AuthInput
                        label="E-posta"
                        type="email"
                        name="email"
                        icon={Mail}
                        placeholder="ornek@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    {/* Password Input */}
                    <div className="space-y-2">
                        <AuthInput
                            label="Şifre"
                            type="password"
                            name="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-slate-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400">
                                    Şifre gücü: <span className="font-bold">{strengthLabels[passwordStrength - 1] || 'Çok Zayıf'}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <AuthInput
                        label="Şifre Tekrar"
                        type="password"
                        name="confirmPassword"
                        icon={Lock}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        success={formData.confirmPassword && formData.password === formData.confirmPassword}
                        required
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Kayıt yapılıyor...
                            </>
                        ) : (
                            'Hesap Oluştur'
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

                    {/* Social Sign Up */}
                    <div className="space-y-3">
                        <SocialButton
                            provider="google"
                            icon={Chrome}
                            onClick={() => handleSocialSignUp('oauth_google')}
                        />
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center pt-4 border-t border-slate-800">
                        <p className="text-slate-400 text-sm">
                            Zaten hesabınız var mı?{' '}
                            <Link
                                href="/sign-in"
                                className="text-amber-500 hover:text-amber-400 font-bold transition-colors"
                            >
                                Giriş yapın
                            </Link>
                        </p>
                    </div>
                </form>
            </AuthCard>
        </div>
    );
}
