import dbConnect from '@/lib/dbConnect';
import Event from '@/lib/model/Event';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const events = await Event.find();
        const formattedEvents = events.map((event: any) => ({
            _id: event._id.toString(),
            eventName: event.eventName,
            description: event.description,
            dateTime: event.dateTime.toISOString(),
            duration: event.duration,
            type: event.type,
            maxAttendees: event.maxAttendees.toString(),
            liveCountUser: event.liveCountUser,
        }));

        return NextResponse.json(formattedEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error fetching events',
            },
            { status: 500 }
        );
    }
}
