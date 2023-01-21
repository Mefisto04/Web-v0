import { z } from 'zod';

// Schema for validating the event form
export const eventSchema = z.object({
    eventName: z.string().min(1, "Event name is required"),
    description: z.string().min(1, "Description is required"),
    dateTime: z.string().min(1, "Date and time are required"),
    duration: z.string().min(1, "Duration is required"),
    type: z.enum(['Virtual', 'Hybrid']),
    maxAttendees: z.string().min(1, "Max attendees are required"),
    liveCountUser: z.number().default(0),
});

export type Event = z.infer<typeof eventSchema> & {
    _id: string;
    liveCountUser: number;
};
