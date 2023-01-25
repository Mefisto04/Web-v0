import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/model/Event';
import User from '@/model/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(
    request: Request,
    { params }: { params: { eventId: string } }
) {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const event = await Event.findById(params.eventId);
        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isAlreadyRegistered = user.registeredEvents.some(
            (reg) => reg.eventId.toString() === params.eventId
        );

        if (isAlreadyRegistered) {
            return NextResponse.json(
                { message: 'Already registered for this event' },
                { status: 400 }
            );
        }

        const newRegisteredEvent = {
            eventId: new mongoose.Types.ObjectId(params.eventId),
            registeredAt: new Date()
        };

        user.registeredEvents.push(newRegisteredEvent);
        await user.save();

        event.liveCountUser = (event.liveCountUser || 0) + 1;
        await event.save();

        return NextResponse.json({ message: 'Successfully registered for the event' });
    } catch (error) {
        console.error('Error registering for event:', error);
        return NextResponse.json(
            { message: 'Error registering for event' },
            { status: 500 }
        );
    }
}