"use client";

import React, { useState, useEffect } from 'react';
import MobileLanding from "@/components/mobile/MobileLanding";
import HomeClient from "@/components/home/HomeClient";
import { useMobile } from "@/context/MobileContext";

export default function HomeWrapper() {
    const { isMobile } = useMobile();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR or before hydration, we might want to show a loader or 
    // nothing to avoid the wrong component flash. 
    // However, HomeClient/MobileLanding have their own internal mounted checks too.
    if (!mounted) {
        return <div className="min-h-screen bg-[#0b0c0f]" />;
    }

    if (isMobile) {
        return <MobileLanding />;
    }

    return <HomeClient />;
}
