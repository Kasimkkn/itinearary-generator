"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDetails } from "itinerary-generator";
import { useForm } from "react-hook-form";
import * as z from "zod";

const today = new Date().toISOString().split("T")[0];

const formSchema = z.object({
  departureCity: z.string().min(1, "Departure city is required"),
  arrivalCity: z.string().min(1, "Arrival city is required"),
  departureDate: z
    .string()
    .min(1, "Departure date is required")
    .refine((date) => new Date(date) >= new Date(today), {
      message: "Departure date must be today or later",
    }),
  returnDate: z.string().min(1, "Return date is required"),
  adults: z
    .number()
    .min(1, "At least one adult is required"),
  children: z.number().min(0, "Number of children cannot be negative"),
  infants: z.number().min(0, "Number of infants cannot be negative"),
  activities: z.array(z.string()).min(1, "Select at least one activity"),
  budgetType: z.string().min(1, "Budget type is required"),
}).refine((data) => new Date(data.returnDate) > new Date(data.departureDate), {
  message: "Return date must be after departure date",
  path: ["returnDate"],
});

const activities = [
  "Sightseeing",
  "Shopping",
  "Food & Dining",
  "Nature",
  "Adventure",
  "Culture",
  "Relaxation",
  "Nightlife",
];

const budgetTypes = ["Budget", "Moderate", "Luxury"];

export interface TravelPlanningFormProps {
  onSubmit: (values: FormDetails) => void;
}

export default function TravelPlanningForm({ onSubmit }: Readonly<TravelPlanningFormProps>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departureCity: "",
      arrivalCity: "",
      departureDate: "",
      returnDate: "",
      adults: 1,
      children: 0,
      infants: 0,
      activities: [],
      budgetType: "",
    },
    mode: "onChange",
  });

  const departureDate = form.watch("departureDate");

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedValues: FormDetails = {
      departureCity: values.departureCity,
      arrivalCity: values.arrivalCity,
      departureDate: values.departureDate,
      arrivalDate: values.returnDate,
      travelers: {
        adults: values.adults,
        children: values.children,
        infants: values.infants,
      },
      preferences: {
        activities: values.activities,
        budgetType: values.budgetType as "Budget" | "Mid-range" | "Luxury",
      },
    };
    onSubmit(formattedValues);
  };

  const minReturnDate = departureDate
    ? new Date(new Date(departureDate).setDate(new Date(departureDate).getDate() + 1)).toISOString().split("T")[0]
    : today;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="departureCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter departure city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arrivalCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrival City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter arrival city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={today}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={minReturnDate}
                    {...field}
                    // If return date is before or equal to departure date, reset it
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (departureDate && new Date(newValue) <= new Date(departureDate)) {
                        form.setError("returnDate", {
                          type: "manual",
                          message: "Return date must be after departure date"
                        });
                      } else {
                        form.clearErrors("returnDate");
                      }
                      field.onChange(newValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adults</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children (2-12)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="infants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Infants (under 2)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="activities"
          render={() => (
            <FormItem>
              <FormLabel>Activities</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {activities.map((activity) => (
                  <FormField
                    key={activity}
                    control={form.control}
                    name="activities"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(activity)}
                            onCheckedChange={(checked) => {
                              const updatedActivities = checked
                                ? [...field.value, activity]
                                : field.value?.filter((a) => a !== activity);
                              field.onChange(updatedActivities);
                            }}
                          />
                        </FormControl>
                        <Label>{activity}</Label>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
                >
                  {budgetTypes.map((type) => (
                    <FormItem
                      key={type}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <RadioGroupItem value={type} />
                      </FormControl>
                      <Label>{type}</Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-white"
        >
          Generate Itinerary
        </Button>
      </form>
    </Form>
  );
}