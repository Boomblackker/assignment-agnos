import LiveMonitor from "@/components/staff/LiveMonitor";

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Hospital Staff View
        </h1>
        <LiveMonitor />
      </div>
    </div>
  );
}
