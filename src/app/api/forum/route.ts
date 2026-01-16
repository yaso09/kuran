import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const users = await clerkClient.users.getUserList({
            limit: 500, // Adjust as needed
        });

        const allComments: any[] = [];

        users.data.forEach(user => {
            const comments = (user.unsafeMetadata.comments as Record<string, any>) || {};
            Object.entries(comments).forEach(([verseKey, verseComments]) => {
                if (Array.isArray(verseComments)) {
                    verseComments.forEach(comment => {
                        allComments.push({
                            ...comment,
                            verseKey,
                            userImage: user.imageUrl, // Ensure we use the latest image
                            userName: user.fullName || "Kullanıcı"
                        });
                    });
                }
            });
        });

        // Sort by timestamp descending
        allComments.sort((a, b) => b.timestamp - a.timestamp);

        return NextResponse.json({ comments: allComments });
    } catch (error) {
        console.error("[FORUM_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
