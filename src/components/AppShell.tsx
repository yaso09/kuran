"use client";

import { MobileProvider, useMobile } from "@/context/MobileContext";
import BottomNav from "./mobile/BottomNav";
import Footer from "./Footer";

interface AppShellProps {
    children: React.ReactNode;
    isMobile: boolean;
}

function AppShellContent({ children }: { children: React.ReactNode }) {
    const { isMobile } = useMobile();

    return (
        <div className={`min-h-screen flex flex-col ${isMobile ? "pb-24" : ""}`}>
            <div className="flex-1">
                {children}
            </div>
            {!isMobile && <Footer />}
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
