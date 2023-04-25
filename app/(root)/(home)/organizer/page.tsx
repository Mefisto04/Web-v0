import EventForm from "@/components/EventForm";

export default function OrganizerPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-4xl font-semibold mb-6">Create New Event</h1>
      <EventForm />
    </div>
  );
}
