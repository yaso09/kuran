"use client";

import { MobileProvider } from "@/context/MobileContext";
import BottomNav from "./mobile/BottomNav";

interface AppShellProps {
    children: React.ReactNode;
    isMobile: boolean;
}

export default function AppShell({ children, isMobile }: AppShellProps) {
    return (
        <MobileProvider isMobile={isMobile}>
            <div className={`min-h-screen ${isMobile ? "pb-24" : ""}`}>
                {children}
                {isMobile && <BottomNav />}
            </div>
        </MobileProvider>
    );
}
