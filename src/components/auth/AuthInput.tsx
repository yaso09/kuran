import React, { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    success?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    ({ label, icon: Icon, error, success, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                </label>
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <Icon size={18} />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full bg-[#0b0c0f] border rounded-xl py-3 px-4 text-white
              placeholder:text-slate-600 outline-none transition-all
              ${Icon ? 'pl-12' : ''}
              ${error
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                : success
                                    ? 'border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                    : 'border-slate-800 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                            }
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
