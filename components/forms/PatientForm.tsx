"use client";

import { PatientData, patientSchema } from "@/app/schemas/patientSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Combobox } from "../ui/combobox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "../ui/datepicker";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type Option = { label: string; value: string };
interface CountryResponse {
  name: {
    common: string;
  };
}

const syncToStaff = async (data: Partial<PatientData>) => {
  try {
    await fetch("api/patient/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Sync error:", error);
  }
};

export default function PatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nationalities, setNationalities] = useState<Option[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      status: "active",
      gender: "other",
    },
  });

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceSyncRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "status") return;
      setValue("status", "active");

      if (debounceSyncRef.current) clearTimeout(debounceSyncRef.current);
      debounceSyncRef.current = setTimeout(() => {
        syncToStaff({ ...value, status: "active" } as PatientData);
      }, 500);

      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        setValue("status", "inactive");
        syncToStaff({ ...value, status: "inactive" } as PatientData);
      }, 5000);
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    const fechNationalities = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name"
        );
        const data: CountryResponse[] = await res.json();

        const options = data
          .map((country) => ({
            label: country.name.common,
            value: country.name.common,
          }))
          .sort((a: Option, b: Option) => a.label.localeCompare(b.label));
        setNationalities(options);
      } catch (error) {
        console.error("Failed to fetch countries", error);
        setNationalities([
          { label: "Thailand", value: "Thailand" },
          { label: "United States", value: "United States" },
        ]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fechNationalities();
  }, []);

  const onSubmit = async (data: PatientData) => {
    setIsSubmitting(true);

    data.status = "submitted";

    await syncToStaff(data);

    toast.success("Registration successful!", {
      description: "Your information has been sent to the staff.",
    });
    setIsSubmitting(false);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-xl shadow-md border"
    >
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Patient Registration
        </h2>
        <p className="text-gray-500 text-sm">
          Please fill in your details below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input id="firstName" type="text" {...register("firstName")} />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-xs">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="firstName" type="text" {...register("middleName")} />
          </div>
          {errors.middleName && (
            <p className="text-red-500 text-xs">{errors.middleName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" type="text" {...register("lastName")} />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-xs">{errors.lastName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="dateOfBirth">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date?.toISOString())}
                />
              )}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label>
              Gender <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full p-5 border rounded-md">
                    <SelectValue placeholder="Select preferred language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="phoneNumber">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              {...register("phoneNumber")}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^0-9]/g,
                  ""
                );
              }}
              maxLength={10}
              placeholder="0800000000"
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label>Religion</Label>
            <Controller
              name="religion"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full p-5 border rounded-md">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buddhism">Buddhism (พุทธ)</SelectItem>
                    <SelectItem value="Christianity">
                      Christianity (คริสต์)
                    </SelectItem>
                    <SelectItem value="Islam">Islam (อิสลาม)</SelectItem>
                    <SelectItem value="Hinduism">Hinduism (ฮินดู)</SelectItem>
                    <SelectItem value="Sikhism">Sikhism (ซิกข์)</SelectItem>
                    <SelectItem value="Other">Other (อื่นๆ)</SelectItem>
                    <SelectItem value="No Religion">
                      No Religion (ไม่มีศาสนา)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="123 Street..."
            rows={6}
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
            {...register("address")}
          />
        </div>
        {errors.address && (
          <p className="text-red-500 text-xs">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label>
              Nationality <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="nationality"
              control={control}
              render={({ field }) => (
                <Combobox
                  options={nationalities}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={
                    isLoadingCountries
                      ? "Loading countries..."
                      : "Select nationality"
                  }
                  searchPlaceholder="Search country..."
                />
              )}
            />
          </div>
          {errors.nationality && (
            <p className="text-red-500 text-xs">
              {errors.nationality.message?.toString()}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="grid w-full items-center gap-2">
            <Label>
              Preferred Language <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="preferredLanguage"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full p-5 border rounded-md">
                    <SelectValue placeholder="Select preferred language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thai">Thailand</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>
      <div className="pt-6 w-full border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Additional Emergency Contact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Name</Label>
            <Input
              id="emergencyContactName"
              {...register("emergencyContactName")}
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
            <Input
              id="emergencyContactRelationship"
              {...register("emergencyContactRelationship")}
              placeholder=""
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </form>
  );
}
