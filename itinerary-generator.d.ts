declare module 'itinerary-generator' {
    import { FC } from 'react';

    export interface FormDetails {
        departureCity: string;
        arrivalCity: string;
        departureDate: string;
        arrivalDate: string;
        travelers: {
            adults: number;
            children: number;
            infants: number;
        };
        preferences: {
            activities: string[];
            budgetType: 'Budget' | 'Mid-range' | 'Luxury';
        };
    }

    export interface ItineraryDay {
        day: number;
        date: string;
        activity: string;
        location: string;
        images: string[];
        meal_suggestions: string[];
        estimated_cost: number;
        additional_notes: string;
    }

    export interface ItineraryResult {
        departure_city: string;
        arrival_city: string;
        departure_date: string;
        arrival_date: string;
        travelers: {
            adults: number;
            children: number;
            infants: number;
        };
        budget_type: 'Budget' | 'Mid-range' | 'Luxury';
        itinerary: ItineraryDay[];
    }

    export interface ItineraryFormProps {
        apiKey: string;
        onDataReceived: (data: ItineraryResult) => void;
        formDetails: FormDetails;
        key?: string;
    }

    const ItineraryForm: FC<ItineraryFormProps>;
    export default ItineraryForm;
}