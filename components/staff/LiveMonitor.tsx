"use client";

import { PatientData } from "@/app/schemas/patientSchema";
import { pusherClient } from "@/lib/pusher";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function LiveMonitor() {
  const [data, setData] = useState<PatientData | null>(null);
  const [isConnect, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe("hospital-queue");

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channel.bind("patient-update", (incomingData: PatientData) => {
      console.log("Received:", incomingData);
      setData(incomingData);
    });

    return () => {
      pusherClient.unsubscribe("hospital-queue");
    };
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "inactive":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "submitted":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500";
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">
        Waiting for patient input....{" "}
        {isConnect ? "(Connected)" : "(Connecting..."}
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <h2 className="text-xl font-bold">Patient Monitor</h2>
          <p className="text-sm text-gray-500">Real-time synchronization</p>
        </div>
        <div
          className={`px-4 py-2 my-4 text-white rounded-full font-medium capitalize ${getStatusColor(
            data.status
          )}`}
        >
          {data.status || "Unknown"}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Personal Information">
          <InfoRow label="First Name" value={data.firstName} />
          <InfoRow label="Middle Name" value={data.middleName} />
          <InfoRow label="Last Name" value={data.lastName} />
          <InfoRow label="Gender" value={data.gender} />
          <InfoRow
            label="Date of Birth"
            value={
              data.dateOfBirth
                ? format(new Date(data.dateOfBirth), "dd MMMM yyyy")
                : "-"
            }
          />
        </InfoCard>

        <InfoCard title="Contact Details">
          <InfoRow label="Phone" value={data.phoneNumber} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Address" value={data.address} />
        </InfoCard>

        <InfoCard title="Additional Info">
          <InfoRow label="Nationality" value={data.nationality} />
          <InfoRow label="Language" value={data.preferredLanguage} />
          <InfoRow label="Religion" value={data.religion} />
        </InfoCard>

        <InfoCard title="Emergency Contact">
          <InfoRow label="Name" value={data.emergencyContactName} />
          <InfoRow
            label="Relationship"
            value={data.emergencyContactRelationship}
          />
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}:</span>
      <span
        className={`font-medium ${
          value ? "text-gray-900" : "text-gray-300 italic"
        }`}
      >
        {value || "Not provided"}
      </span>
    </div>
  );
}
