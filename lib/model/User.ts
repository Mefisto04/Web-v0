import mongoose, { Schema, Document } from 'mongoose';

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface RegisteredEvent {
  eventId: mongoose.Types.ObjectId;
  registeredAt: Date;
}

const RegisteredEventSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  registeredAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  role: 'admin' | 'organizer' | 'viewer';
  messages: Message[];
  registeredEvents: RegisteredEvent[];
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify Code is required'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify Code Expiry is required'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'organizer', 'viewer'],
      message: '{VALUE} is not supported'
    },
    required: true,
    default: 'viewer'
  },
  messages: [MessageSchema],
  registeredEvents: [RegisteredEventSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;