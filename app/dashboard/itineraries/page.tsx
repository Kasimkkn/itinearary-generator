"use client";

import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ItineraryGrid from "@/components/ItineraryGrid";
import { useToast } from "@/hooks/use-toast";
import { ItineraryResult } from 'itinerary-generator';
import { CalendarDays, MapPin, Users, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/modal';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const Itineraries = () => {
    const [itineraries, setItineraries] = useState<(ItineraryResult & { _id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null);

    const fetchItineraries = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("itinerary:token");
            const apiKey = localStorage.getItem("itinerary:apiKey");

            if (!token || !apiKey) {
                setError("Unauthorized: Missing token or API key");
                return;
            }

            const response = await axios.get(`${API_URL}/itineraries`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-api-key": apiKey,
                },
            });

            if (response.data.data.length === 0) {
                setItineraries([]); // Just set an empty array without an error
            } else {
                setItineraries(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching itineraries:", error);
            setError("An error occurred while fetching itineraries");
            toast({
                title: "Error",
                description: "An error occurred while fetching itineraries",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteItinerary = async (id: string) => {
        try {
            const token = localStorage.getItem("itinerary:token");
            const apiKey = localStorage.getItem("itinerary:apiKey");

            if (!token || !apiKey) {
                toast({ title: "Unauthorized", description: "Missing token or API key", variant: "destructive" });
                return;
            }

            await axios.delete(`${API_URL}/itineraries/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-api-key": apiKey,
                },
            });

            setItineraries(prev => prev.filter(itinerary => itinerary._id !== id));
            toast({
                title: "Success",
                description: "Itinerary deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting itinerary:", error);
            toast({
                title: "Error",
                description: "An error occurred while deleting the itinerary",
                variant: "destructive",
            });
        } finally {
            setIsModalOpen(false);
            setItineraryToDelete(null);
        }
    };




    const confirmDelete = (id: string) => {
        setItineraryToDelete(id);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchItineraries();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <Button onClick={fetchItineraries} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    if (itineraries.length === 0) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <p className="text-lg font-medium">No itineraries found.</p>
                    <p className="text-muted-foreground">Generate a new itinerary to see it here!</p>
                </div>
            </Card>
        );
    }


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center">Your Saved Itineraries</h1>

            <Accordion type="single" collapsible className="w-full">
                {itineraries.map((itinerary, index) => (
                    <AccordionItem key={itinerary._id} value={itinerary._id}>
                        <div className="border p-4 rounded-lg mb-4 overflow-hidden bg-white">
                            <div className="flex justify-between items-center">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex-1 text-left">
                                        <h3 className="text-xl font-semibold">
                                            {itinerary.departure_city} to {itinerary.arrival_city}
                                        </h3>
                                        <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1">
                                                <CalendarDays size={16} />
                                                <span>{new Date(itinerary.departure_date).toLocaleDateString()} - {new Date(itinerary.arrival_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users size={16} />
                                                <span>{itinerary.travelers.adults + itinerary.travelers.children + itinerary.travelers.infants} travelers</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={16} />
                                                <span>{itinerary.itinerary.length} day trip</span>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(itinerary._id);
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    aria-label="Delete itinerary"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>

                            <AccordionContent className="pb-0 px-0 mt-6">
                                <ItineraryGrid itinerary={itinerary} isFromSingleItinerary={true} />
                            </AccordionContent>
                        </div>
                    </AccordionItem>
                ))}
            </Accordion>

            <div className="flex justify-center mt-6">
                <Button onClick={fetchItineraries} variant="default">
                    Refresh Itineraries
                </Button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-lg font-semibold">Are you sure you want to delete this itinerary?</h2>
                <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button onClick={() => setIsModalOpen(false)} variant="secondary">
                        Cancel
                    </Button>
                    <Button onClick={() => itineraryToDelete && handleDeleteItinerary(itineraryToDelete)} variant="default">
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Itineraries;