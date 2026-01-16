import React, { ButtonHTMLAttributes } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    provider: 'google' | 'github' | 'facebook';
    icon?: LucideIcon;
    loading?: boolean;
}

const providerConfig = {
    google: {
        name: 'Google',
        bgColor: 'bg-white hover:bg-gray-100',
        textColor: 'text-gray-900',
        borderColor: 'border-gray-300',
    },
    github: {
        name: 'GitHub',
        bgColor: 'bg-[#24292e] hover:bg-[#1a1e22]',
        textColor: 'text-white',
        borderColor: 'border-[#24292e]',
    },
    facebook: {
        name: 'Facebook',
        bgColor: 'bg-[#1877f2] hover:bg-[#166fe5]',
        textColor: 'text-white',
        borderColor: 'border-[#1877f2]',
    },
};

export default function SocialButton({
    provider,
    icon: Icon,
    loading = false,
    children,
    className = '',
    ...props
}: SocialButtonProps) {
    const config = providerConfig[provider];

    return (
        <button
            className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
        border font-bold text-sm transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                Icon && <Icon size={18} />
            )}
            {children || `${config.name} ile devam et`}
        </button>
    );
}
