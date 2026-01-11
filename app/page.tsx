import Link from "next/link";
import PatientForm from "../components/forms/PatientForm";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
            Welcome to Agnos Hospital
          </h1>
          <p className="text-gray-600">Real-time Patient Intake System</p>
          <Link href={"/staff"} target="_blank">
            <Button>Staff Page</Button>
          </Link>
        </div>
        <PatientForm />
      </div>
    </main>
  );
}
