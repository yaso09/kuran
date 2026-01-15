import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { verseKey } = await req.json();

        if (!verseKey) {
            return new NextResponse("Verse key is required", { status: 400 });
        }

        const user = await clerkClient.users.getUser(userId);
        const unsafeMetadata = user.unsafeMetadata;

        let bookmarks = (unsafeMetadata.bookmarks as string[]) || [];

        if (bookmarks.includes(verseKey)) {
            bookmarks = bookmarks.filter((k) => k !== verseKey);
        } else {
            bookmarks = [...bookmarks, verseKey];
        }

        await clerkClient.users.updateUserMetadata(userId, {
            unsafeMetadata: {
                ...unsafeMetadata,
                bookmarks: bookmarks
            }
        });

        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error("[BOOKMARK_POST]", error);
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
        const bookmarks = (user.unsafeMetadata.bookmarks as string[]) || [];

        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error("[BOOKMARK_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
