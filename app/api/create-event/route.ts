import dbConnect from '@/lib/dbConnect';
import Event from '@/model/Event';
import { eventSchema } from '@/schemas/eventSchema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        console.log('Received request body:', body);

        // Validate data using Zod schema
        const parsedData = eventSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: parsedData.error.errors[0].message,
                },
                { status: 400 }
            );
        }

        const newEvent = new Event({
            ...parsedData.data,
            liveCountUser: 0,
        });

        const savedEvent = await newEvent.save();
        console.log('Saved event:', savedEvent.toObject());

        return NextResponse.json(
            {
                success: true,
                message: 'Event created successfully',
                event: savedEvent,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error creating event',
            },
            { status: 500 }
        );
    }
}