import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItineraryDay, ItineraryResult } from 'itinerary-generator';
import { Calendar, MapPin, DollarSign, Users, Coffee, Utensils, Sun, Moon, Compass, Info } from 'lucide-react';

interface ItineraryGridProps {
    itinerary: ItineraryResult;
    isFromSingleItinerary?: boolean;
}

export default function ItineraryGrid({ itinerary, isFromSingleItinerary = false }: ItineraryGridProps) {
    const getDayGradient = (index: number) => {
        const gradients = [
            'bg-gradient-to-br from-blue-50 to-indigo-100',
            'bg-gradient-to-br from-emerald-50 to-teal-100',
            'bg-gradient-to-br from-amber-50 to-orange-100',
            'bg-gradient-to-br from-rose-50 to-pink-100',
            'bg-gradient-to-br from-violet-50 to-purple-100'
        ];
        return gradients[index % gradients.length];
    };

    // Helper to determine meal icon
    const getMealIcon = (meal: string) => {
        const lowerMeal = meal.toLowerCase();
        if (lowerMeal.includes('breakfast')) return <Coffee size={14} />;
        if (lowerMeal.includes('lunch')) return <Sun size={14} />;
        if (lowerMeal.includes('dinner')) return <Moon size={14} />;
        return <Utensils size={14} />;
    };

    return (
        <div className="space-y-6 relative">
            {!isFromSingleItinerary && (
                <div className="flex items-center gap-2">
                    <Compass className="text-primary w-8 h-8 " />
                    <h2 className="text-2xl font-bold">Your Itinerary</h2>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                <Card className="border-l-4 border-l-accent overflow-hidden relative">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-primary" />
                            <CardTitle>Trip Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium">Departure</p>
                                    <p>{itinerary.departure_city} on {itinerary.departure_date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium">Arrival</p>
                                    <p>{itinerary.arrival_city} on {itinerary.arrival_date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <DollarSign className="text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium">Budget</p>
                                    <p>{itinerary.budget_type}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Users className="text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium">Travelers</p>
                                    <p>{itinerary.travelers.adults} Adults, {itinerary.travelers.children} Children, {itinerary.travelers.infants} Infants</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-2">
                    {itinerary.itinerary.map((day: ItineraryDay, index: number) => (
                        <Card
                            key={index}
                            className={`hover:shadow-lg transition relative overflow-hidden ${getDayGradient(index)}`}
                        >
                            <CardHeader className="border-b">
                                <div className="flex justify-between items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="font-bold text-sm text-primary">D{index + 1}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex gap-2">
                                    <Compass className="text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-medium">Activities</p>
                                        <p>{day.activity}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <MapPin className="text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-medium">Location</p>
                                        <p>{day.location}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <DollarSign className="text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-medium">Estimated Cost</p>
                                        <p>{day.estimated_cost}</p>
                                    </div>
                                </div>

                                {day.additional_notes && (
                                    <div className="flex gap-2">
                                        <Info className="text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-medium">Notes</p>
                                            <p>{day.additional_notes}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="font-medium mb-2">Meal Suggestions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {day.meal_suggestions.map((meal, i) => (
                                            <span key={i + 1} className="px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1 text-sm">
                                                {getMealIcon(meal)}
                                                {meal}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}