import mongoose, { Schema, Document } from 'mongoose';

interface IEvent extends Document {
    eventName: string;
    description: string;
    dateTime: Date;
    duration: string;
    type: 'Virtual' | 'Hybrid';
    maxAttendees: number;
    liveCountUser: number;
}

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dateTime: {
        type: Date,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Virtual', 'Hybrid'],
        required: true,
    },
    maxAttendees: {
        type: Number,
        required: true,
    },
    liveCountUser: {
        type: Number,
        default: 0,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

if (mongoose.models.Event) {
    delete mongoose.models.Event;
}

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
// const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// export default Event;
