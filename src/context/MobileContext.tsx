"use client";

import React, { createContext, useContext } from 'react';

type MobileContextType = {
    isMobile: boolean;
};

const MobileContext = createContext<MobileContextType>({ isMobile: false });

export const MobileProvider = ({
    children,
    isMobile
}: {
    children: React.ReactNode;
    isMobile: boolean;
}) => {
    return (
        <MobileContext.Provider value={{ isMobile }}>
            {children}
        </MobileContext.Provider>
    );
};

export const useMobile = () => useContext(MobileContext);
