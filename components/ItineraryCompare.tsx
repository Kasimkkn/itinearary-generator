"use client"
import compareItineraryData from '@/data/compareItinerary.json';
import { Activity, AlignLeft, Building, CheckCircle, DollarSign, Filter, Info, MapPin, Plane, SortAsc, SortDesc, Star } from 'lucide-react';
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

type SortField = 'totalPrice' | 'rating' | 'reviewCount';
type Category = 'flight' | 'hotel' | 'activities' | 'price';

const ItineraryCompare = () => {
    const [data, setData] = useState(compareItineraryData);
    const [sortField, setSortField] = useState('totalPrice');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedCategories, setSelectedCategories] = useState(['price']);
    const [filterActive, setFilterActive] = useState(false);

    const sortedProviders = [...data.providers].sort((a, b) => {
        let valueA, valueB;

        if (sortField === 'totalPrice') {
            valueA = a.packageDetails.totalPrice;
            valueB = b.packageDetails.totalPrice;
        } else if (sortField === 'rating') {
            valueA = a.rating;
            valueB = b.rating;
        } else if (sortField === 'reviewCount') {
            valueA = a.reviewCount;
            valueB = b.reviewCount;
        }

        return sortDirection === 'asc' ? valueA! - valueB! : valueB! - valueA!;
    });

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const toggleCategory = (category: Category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const formatDate = (dateString: string) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
                <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <Card className="p-4 mb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {data.searchCriteria.departureCity} to {data.searchCriteria.arrivalCity}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {formatDate(data.searchCriteria.departureDate)} - {formatDate(data.searchCriteria.arrivalDate)}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">{data.searchCriteria.travelers.adults} Adults, </span>
                            <span className="font-medium">{data.searchCriteria.travelers.children} Child</span>
                            {data.searchCriteria.travelers.infants > 0 && (
                                <span className="font-medium">, {data.searchCriteria.travelers.infants} Infant</span>
                            )}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {data.searchCriteria.preferences.activities.map((activity, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {activity}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-4 mb-3">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                        <button
                            onClick={() => toggleSort('totalPrice')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${sortField === 'totalPrice' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <DollarSign size={16} className="mr-1" />
                            Price
                            {sortField === 'totalPrice' && (
                                sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
                            )}
                        </button>
                        <button
                            onClick={() => toggleSort('rating')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${sortField === 'rating' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <Star size={16} className="mr-1" />
                            Rating
                            {sortField === 'rating' && (
                                sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
                            )}
                        </button>
                        <button
                            onClick={() => toggleSort('reviewCount')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${sortField === 'reviewCount' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <AlignLeft size={16} className="mr-1" />
                            Reviews
                            {sortField === 'reviewCount' && (
                                sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
                            )}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterActive(!filterActive)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${filterActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <Filter size={16} className="mr-1" />
                            Filter
                        </button>
                    </div>
                </div>

                {filterActive && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Compare categories:</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => toggleCategory('flight')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${selectedCategories.includes('flight') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Plane size={14} className="inline mr-1" />
                                Flights
                            </button>
                            <button
                                onClick={() => toggleCategory('hotel')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${selectedCategories.includes('hotel') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Building size={14} className="inline mr-1" />
                                Hotel
                            </button>
                            <button
                                onClick={() => toggleCategory('activities')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${selectedCategories.includes('activities') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <Activity size={14} className="inline mr-1" />
                                Activities
                            </button>
                            <button
                                onClick={() => toggleCategory('price')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${selectedCategories.includes('price') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                <DollarSign size={14} className="inline mr-1" />
                                Price breakdown
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Package Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProviders.map((provider) => (
                    <Card key={provider.packageDetails.packageId} className="overflow-hidden">
                        <div className="p-4 border-b flex flex-col items-center">
                            <div>
                                <img src={provider.logo} alt={provider.providerName} className="w-32 h-20 rounded-full object-cover" />
                            </div>
                            <div className='w-full flex justify-between'>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{provider.providerName}</h2>
                                    <h3 className="text-sm text-gray-600">{provider.packageDetails.packageName}</h3>
                                </div>
                                <div className="flex flex-col items-end">
                                    {renderStars(provider.rating)}
                                    <span className="text-xs text-gray-500">{provider.reviewCount} reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 flex justify-between items-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${provider.packageDetails.totalPrice.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    ${provider.packageDetails.perPersonPrice.toFixed(2)} per person
                                </p>
                                {provider.packageDetails.discountApplied > 0 && (
                                    <p className="text-sm text-green-600">
                                        Save ${provider.packageDetails.discountApplied.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Button variant={'default'}>
                                    Book now
                                </Button>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                    {provider.packageDetails.availability}
                                </p>
                            </div>
                        </div>

                        {selectedCategories.includes('flight') && (
                            <div className="p-4 border-b">
                                <h3 className="font-medium flex items-center mb-3 text-gray-900">
                                    <Plane size={18} className="mr-2" />
                                    Flight Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Outbound</span>
                                            <span>{provider.flightDetails.outbound.airline}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-semibold">
                                                    {formatTime(provider.flightDetails.outbound.departureTime)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {provider.flightDetails.outbound.departureAirport.code}
                                                </p>
                                            </div>
                                            <div className="flex-1 mx-2">
                                                <div className="h-0.5 bg-gray-300 relative">
                                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-accent bg-white"></div>
                                                </div>
                                                <p className="text-xs text-center mt-1 text-gray-500">
                                                    {provider.flightDetails.outbound.duration}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold">
                                                    {formatTime(provider.flightDetails.outbound.arrivalTime)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {provider.flightDetails.outbound.arrivalAirport.code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Return</span>
                                            <span>{provider.flightDetails.inbound.airline}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-semibold">
                                                    {formatTime(provider.flightDetails.inbound.departureTime)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {provider.flightDetails.inbound.departureAirport.code}
                                                </p>
                                            </div>
                                            <div className="flex-1 mx-2">
                                                <div className="h-0.5 bg-gray-300 relative">
                                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-accent bg-white"></div>
                                                </div>
                                                <p className="text-xs text-center mt-1 text-gray-500">
                                                    {provider.flightDetails.inbound.duration}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold">
                                                    {formatTime(provider.flightDetails.inbound.arrivalTime)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {provider.flightDetails.inbound.arrivalAirport.code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {provider.flightDetails.outbound.amenities.map((amenity, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCategories.includes('hotel') && (
                            <div className="p-4 border-b">
                                <h3 className="font-medium flex items-center mb-3 text-gray-900">
                                    <Building size={18} className="mr-2" />
                                    Hotel Details
                                </h3>
                                <h4 className="font-semibold text-gray-900">{provider.accommodationDetails.hotelName}</h4>
                                <p className="text-sm text-gray-600 flex items-start mt-1">
                                    <MapPin size={16} className="mr-1 shrink-0 mt-0.5" />
                                    {provider.accommodationDetails.address}
                                </p>
                                <div className="mt-2 mb-3">
                                    {renderStars(provider.accommodationDetails.rating)}
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Room Type:</span>
                                    <span className="font-medium">{provider.accommodationDetails.roomType}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Meal Plan:</span>
                                    <span className="font-medium">{provider.accommodationDetails.mealPlan}</span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {provider.accommodationDetails.amenities.map((amenity, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCategories.includes('activities') && (
                            <div className="p-4 border-b">
                                <h3 className="font-medium flex items-center mb-3 text-gray-900">
                                    <Activity size={18} className="mr-2" />
                                    Included Activities
                                </h3>
                                <ul className="space-y-2">
                                    {provider.activities.map((activity, index) => (
                                        <li key={index} className="flex">
                                            <CheckCircle size={16} className="mr-2 text-green-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">{activity.name}</p>
                                                <p className="text-xs text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-500">{activity.duration}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {provider.additionalOffers.additionalServices.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Optional Add-ons:</p>
                                        <ul className="space-y-2">
                                            {provider.additionalOffers.additionalServices.map((service, index) => (
                                                <li key={index} className="flex justify-between">
                                                    <span className="text-sm">{service.name}</span>
                                                    <span className="text-sm font-medium">${service.price.toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedCategories.includes('price') && (
                            <div className="p-4 ">
                                <h3 className="font-medium flex items-center mb-3 text-gray-900">
                                    <DollarSign size={18} className="mr-2" />
                                    Price Breakdown
                                </h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Base Fare</span>
                                        <span>${provider.packageDetails.priceBreakdown.baseFare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Taxes</span>
                                        <span>${provider.packageDetails.priceBreakdown.taxes.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Service Charges</span>
                                        <span>${provider.packageDetails.priceBreakdown.serviceCharges.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Insurance</span>
                                        <span>${provider.packageDetails.priceBreakdown.insurance.toFixed(2)}</span>
                                    </div>
                                    {provider.packageDetails.discountApplied > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-${provider.packageDetails.discountApplied.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-sm pt-2 mt-2 border-t">
                                        <span>Total Price</span>
                                        <span>${provider.packageDetails.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 bg-blue-50 rounded p-3 text-sm">
                                    <p className="font-medium flex items-center text-gray-900">
                                        <Info size={16} className="mr-1 text-blue-500" />
                                        Refund Policy
                                    </p>
                                    <p className="text-gray-700 mt-1">{provider.packageDetails.refundPolicy}</p>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

        </div>
    );
};

export default ItineraryCompare;