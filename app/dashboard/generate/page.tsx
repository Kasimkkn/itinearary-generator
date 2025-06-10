"use client";

import ItineraryGrid from "@/components/ItineraryGrid";
import TravelPlanningForm from "@/components/TravelPlanningForm";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import ItineraryForm, { FormDetails, ItineraryResult } from "itinerary-generator";
import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function GenerateItineraryPage() {
  const [apiKey, setApiKey] = useState("");
  const [formData, setFormData] = useState<FormDetails | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
  const [isDataReceived, setIsDataReceived] = useState(false);
  const [isSavedData, setIsSavedData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { toast } = useToast();

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestIdRef = useRef<number>(0);

  useEffect(() => {
    const apiKey = localStorage.getItem("itinerary:apiKey");
    if (apiKey) {
      setApiKey(apiKey);
    } else {
      toast({
        title: "Error",
        description: "API key not found, Generate API key first",
        variant: "destructive",
      });
    }
  }, []);

  const saveItineraryToDatabase = async (data: ItineraryResult, requestId: number) => {
    if (requestId !== lastRequestIdRef.current) return;

    try {
      const token = localStorage.getItem("itinerary:token");
      const apiKey = localStorage.getItem("itinerary:apiKey");

      console.log(`Saving itinerary to database with requestId: ${requestId}`);

      const response = await axios.post(`${API_URL}/itineraries`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": apiKey,
        },
      });

      if (requestId !== lastRequestIdRef.current) return;

      if (response.data.success) {
        setIsSavedData(true);
        toast({
          title: "Success",
          description: "Itinerary generated and saved successfully!",
        });
      }
    } catch (error) {
      if (requestId !== lastRequestIdRef.current) return;

      console.error("Error saving itinerary:", error);
      toast({
        title: "Warning",
        description: "Itinerary generated but failed to save to database.",
        variant: "destructive",
      });
    } finally {
      if (requestId !== lastRequestIdRef.current) return;

      setIsSaving(false);
    }
  };

  const handleItineraryData = (data: ItineraryResult) => {
    console.log("Received itinerary data");

    if (isSaving || isSavedData) {
      console.log("Already saving or saved, ignoring");
      return;
    }

    setItinerary(data);
    setIsDataReceived(true);
    setIsSaving(true);
    setIsFormVisible(false);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const requestId = lastRequestIdRef.current + 1;
    lastRequestIdRef.current = requestId;

    saveTimerRef.current = setTimeout(() => {
      saveItineraryToDatabase(data, requestId);
    }, 100);
  };

  const handleFormSubmit = (formData: FormDetails) => {
    setFormData(formData);
    setIsDataReceived(false);
    setIsSavedData(false);
    setIsSaving(false);
    setItinerary(null);

    lastRequestIdRef.current = 0;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setIsFormVisible(true);
  };

  return (
    <div className="mx-auto space-y-6">
      <h6 className="text-xl text-center text-accent font-bold">Fill out this form to get your Ai generated itinerary</h6>

      <Card className="p-3">
        <TravelPlanningForm onSubmit={handleFormSubmit} />
      </Card>

      <Card className="p-3">
        {!isDataReceived && (
          <p className="text-xl text-center text-accent font-bold">Once you have filled out the form, click the button below to generate your itinerary</p>
        )}
        {formData && !isDataReceived && !isSaving && isFormVisible && (
          <div className="flex justify-center items-center p-6">
            <ItineraryForm
              apiKey={apiKey}
              onDataReceived={handleItineraryData}
              formDetails={{
                departureCity: formData.departureCity,
                arrivalCity: formData.arrivalCity,
                departureDate: formData.departureDate,
                arrivalDate: formData.arrivalDate,
                travelers: {
                  adults: formData.travelers.adults,
                  children: formData.travelers.children,
                  infants: formData.travelers.infants,
                },
                preferences: {
                  activities: formData.preferences.activities,
                  budgetType: formData.preferences.budgetType,
                },
              }}
            />
          </div>
        )}
        {itinerary && (
          <ItineraryGrid itinerary={itinerary} />
        )}
      </Card>
    </div>
  );
}