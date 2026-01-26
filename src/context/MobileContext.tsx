"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type MobileContextType = {
    isMobile: boolean;
};

const MobileContext = createContext<MobileContextType>({ isMobile: false });

export const MobileProvider = ({
    children,
    isMobile: initialIsMobile
}: {
    children: React.ReactNode;
    isMobile: boolean;
}) => {
    // Start with server detection but allow client override
    const [isMobile, setIsMobile] = useState(initialIsMobile);

    useEffect(() => {
        const checkMobile = () => {
            // Standard mobile/tablet breakpoint
            const isWindowMobile = window.innerWidth < 1024; // Using 1024 as desktop threshold
            setIsMobile(isWindowMobile);
        };

        // Initial check on mount
        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <MobileContext.Provider value={{ isMobile }}>
            {children}
        </MobileContext.Provider>
    );
};

export const useMobile = () => useContext(MobileContext);
