"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketProvider";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

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
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/get-events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleJoin = (event: Event) => {
    setSelectedEvent(event);
    setShowJoinDialog(true);
  };

  const onJoinRoom = () => {
    if (roomCode.trim()) {
      // Emit socket event to notify room join
      if (socket) {
        socket.emit("join-room", {
          roomId: roomCode,
          userId: selectedEvent?._id,
        });
      }
      router.push(`/meeting/${roomCode}`);
    } else {
      alert("Please enter a room code");
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

      {/* Join Room Dialog */}
      <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Join Event: {selectedEvent?.eventName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                Enter the room code provided by the event organizer:
              </p>
              <Input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowJoinDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onJoinRoom}>
              Join Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventList;
