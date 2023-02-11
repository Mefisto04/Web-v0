'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, Event } from '@/lib/schemas/eventSchema';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useSession } from 'next-auth/react';
import ReactDatePicker from 'react-datepicker';
import MeetingModal from './MeetingModal';
import Loader from './Loader';

const initialValues = {
  dateTime: new Date(),
  description: '',
};

export default function EventForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Event>({
    resolver: zodResolver(eventSchema),
  });
  const { toast } = useToast();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call | null>(null);
  const client = useStreamVideoClient();
  console.log("cient is ",client);
  const { data: session, status } = useSession(); // Get session from NextAuth
  console.log(session);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/get-events');
      const data = await response.json();
      setEvents(data);
    };

    fetchEvents();
  }, []);

  const createMeeting = async () => {
    if (!client || !session) {
      toast({ title: 'Session is not loaded' });
      return;
    }

    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }

      const id = session.user._id;
      console.log("is is ",id);
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      toast({
        title: 'Meeting Created',
      });
      router.push(`/meeting/${call.id}`);
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  const onSubmit = async (data: Event) => {
    try {
      const response = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setMeetingState('isScheduleMeeting');
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || !session) return <Loader />; // Check session loading state

  return (
    <div className="space-y-8 p-6">
      {/* Displaying the events list */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Created Events</h2>
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-xl">{event.eventName}</h3>
              <p className="text-gray-600">{event.description}</p>
              <p className="mt-2 text-gray-500">
                Date and Time: {new Date(event.dateTime).toLocaleString()}
              </p>
              <p className="mt-2 text-gray-500">
                Live Users: {event.liveCountUser}
              </p>
              <Button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px
              4 rounded"
                onClick={() => setMeetingState('isInstantMeeting')}
              >
                Host Event
              </Button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No events created yet.</p>
        )}
      </div>

      {/* Event Creation Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block text-lg font-semibold">Event Name</label>
          <Input className="mt-2" {...register('eventName')} />
          {errors.eventName && (
            <span className="text-red-500">{errors.eventName.message}</span>
          )}
        </div>
        <div>
          <label className="block text-lg font-semibold">Description</label>
          <Textarea className="mt-2" {...register('description')} />
          {errors.description && (
            <span className="text-red-500">{errors.description.message}</span>
          )}
        </div>
        <div>
          <label className="block text-lg font-semibold">Date and Time</label>
          <ReactDatePicker
            selected={values.dateTime}
            onChange={(date) => setValues({ ...values, dateTime: date! })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full rounded bg-dark-3 p-2 focus:outline-none"
          />
        </div>
        <div>
          <Button type="submit" className="w-full">
            Create Event
          </Button>
        </div>
      </form>

      {/* Meeting Modal */}
      {callDetail && (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            router.push(`/meeting/${callDetail._id}`);
          }}
          image={'/icons/checked.svg'}
          buttonText="Go to Meeting"
        />
      )}

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </div>
  );
}
