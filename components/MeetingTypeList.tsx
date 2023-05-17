'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketProvider';
import { useSession } from 'next-auth/react'; // For session
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import Loader from '@/components/Loader';

interface Event {
  _id: string;
  eventName: string;
  description: string;
  dateTime: string;
  liveCountUser?: number;
}

const EventList = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [meetingState, setMeetingState] = useState<
    'isInstantMeeting' | 'isScheduleMeeting' | undefined
  >(undefined);
  const { data: session, status } = useSession(); // Use NextAuth session
  const [callDetail, setCallDetail] = useState<Call | null>(null);
  const client = useStreamVideoClient(); // Stream Video Client

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/get-events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleJoin = (event: Event) => {
    setSelectedEvent(event);
    setMeetingState('isScheduleMeeting');
  };

  const createMeeting = async () => {
    if (!client || !session) {
      alert('Session is not loaded');
      return;
    }

    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt = new Date().toISOString();
      const description = selectedEvent?.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      router.push(`/meeting/${call.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create meeting');
    }
  };

  const EventCard = ({ event }: { event: Event }) => (
    <div className="border p-4 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold">{event.eventName}</h3>
      <p className="mt-2 text-gray-600">{event.description}</p>
      <p className="mt-2 text-gray-600">
        Date: {new Date(event.dateTime).toLocaleString()}
      </p>
      <Button
        onClick={() => handleJoin(event)}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white"
      >
        Join Event
      </Button>
    </div>
  );

  if (status === 'loading' || !session) return <Loader />; // Check session loading state

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Events</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </div>

      {/* Create Meeting Dialog */}
      {meetingState === 'isScheduleMeeting' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">
            Create Meeting for {selectedEvent?.eventName}
          </h3>
          <Button
            onClick={createMeeting}
            className="bg-green-500 hover:bg-green-700 text-white"
          >
            Create Meeting
          </Button>
        </div>
      )}

      {/* Instant Meeting Button */}
      <Button
        onClick={() => setMeetingState('isInstantMeeting')}
        className="mt-4 bg-orange-500 hover:bg-orange-700 text-white"
      >
        Start Instant Meeting
      </Button>

      {/* Create Instant Meeting */}
      {meetingState === 'isInstantMeeting' && (
        <div className="flex flex-col gap-4">
          <Button
            onClick={createMeeting}
            className="bg-blue-500 hover:bg-blue-700 text-white"
          >
            Start Instant Meeting
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventList;
