"use client";

import { MobileProvider, useMobile } from "@/context/MobileContext";
import BottomNav from "./mobile/BottomNav";

interface AppShellProps {
    children: React.ReactNode;
    isMobile: boolean;
}

function AppShellContent({ children }: { children: React.ReactNode }) {
    const { isMobile } = useMobile();

    return (
        <div className={`min-h-screen transition-all duration-300 ${isMobile ? "pb-24" : ""}`}>
            {children}
            {isMobile && <BottomNav />}
        </div>
    );
}

export default function AppShell({ children, isMobile }: AppShellProps) {
    return (
        <MobileProvider isMobile={isMobile}>
            <AppShellContent>
                {children}
            </AppShellContent>
        </MobileProvider>
    );
}
