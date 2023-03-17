import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/model/Event';

export async function POST(
    request: Request,
    { params }: { params: { eventId: string } }
) {
    await dbConnect();

    try {
        const event = await Event.findById(params.eventId);

        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 });
        }

        event.liveCountUser = (event.liveCountUser || 0) + 1;
        await event.save();

        return NextResponse.json({ message: 'Successfully registered for the event' });
    } catch (error) {
        console.error('Error registering for event:', error);
        return NextResponse.json({ message: 'Error registering for event' }, { status: 500 });
    }
}