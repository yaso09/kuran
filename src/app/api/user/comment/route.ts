import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SURAHS } from "@/lib/constants";
import { SurahData } from "@/types/quran";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const { userId } = auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { verseKey, comment, comments: newCommentsArray } = await req.json();

        if (!verseKey) {
            return new NextResponse("Verse key is required", { status: 400 });
        }

        const user = await clerkClient.users.getUser(userId);
        const unsafeMetadata = user.unsafeMetadata;

        let allComments = (unsafeMetadata.comments as Record<string, any>) || {};

        if (newCommentsArray) {
            // New structure: Array of comments passed directly
            allComments[verseKey] = newCommentsArray;
        } else if (comment !== undefined) {
            // Legacy/Fallback: Handle single comment string
            if (comment === "" || comment === null) {
                delete allComments[verseKey];
            } else {
                allComments[verseKey] = [{
                    id: Date.now().toString(),
                    text: comment,
                    timestamp: Date.now(),
                    userId,
                    userName: user.fullName || "Kullanıcı"
                }];
            }
        }

        await clerkClient.users.updateUserMetadata(userId, {
            unsafeMetadata: {
                ...unsafeMetadata,
                comments: allComments
            }
        });

        return NextResponse.json({ comments: allComments });
    } catch (error) {
        console.error("[COMMENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    const { userId } = auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await clerkClient.users.getUser(userId);
        const comments = (user.unsafeMetadata.comments as Record<string, any>) || {};

        return NextResponse.json({ comments });
    } catch (error) {
        console.error("[COMMENT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
