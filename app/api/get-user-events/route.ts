// app/api/get-user-events/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import Event from "@/model/Event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Get all registered event IDs
        const registeredEventIds = user.registeredEvents.map(reg => reg.eventId);

        // Fetch the full event details for all registered events
        const registeredEvents = await Event.find({
            '_id': { $in: registeredEventIds }
        });

        return NextResponse.json(registeredEvents);
    } catch (error) {
        console.error("Error fetching user events:", error);
        return NextResponse.json(
            { message: "Error fetching user events" },
            { status: 500 }
        );
    }
}