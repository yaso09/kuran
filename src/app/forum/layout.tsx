import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tefekkür Forumu",
    description: "Ayetler üzerine düşüncelerinizi paylaşın, toplulukla birlikte Kur'an üzerine tefekkür edin.",
    alternates: {
        canonical: 'https://kurancilar.com/forum',
    },
};

export default function ForumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
