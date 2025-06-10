import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Compass, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {

  const popularDestinations = [
    {
      name: "Bali, Indonesia",
      image: "https://tse4.mm.bing.net/th?id=OIP.h3Whc7TEjBafspseEoru7wHaE7&pid=Api&P=0&h=180",
      description: "Tropical paradise with stunning beaches and rich culture",
      tripCount: 8
    },
    {
      name: "Santorini, Greece",
      image: "https://tse4.mm.bing.net/th?id=OIP.-PblVTP-o_rqdEW1xoQ1kAHaE8&pid=Api&P=0&h=180",
      description: "Iconic white buildings with breathtaking Aegean Sea views",
      tripCount: 6
    },
    {
      name: "Kyoto, Japan",
      image: "https://tse2.mm.bing.net/th?id=OIP.tYgERQs-eycMAZ38L5AmiQHaE8&pid=Api&P=0&h=180",
      description: "Ancient temples and beautiful cherry blossoms",
      tripCount: 5
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent to-blue-500 opacity-40"></div>
        <img
          src="https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Travel scenery"
          className="w-full h-64 object-fill"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Your Travel Dashboard</h1>
          <p className="text-white/90 text-lg max-w-lg">
            Create stunning travel itineraries for your clients with our powerful AI-powered platform
          </p>
        </div>
      </div>

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/generate">
            <div className="p-6 rounded-lg border border-accent/20 hover:bg-accent/5 transition-colors flex items-start space-x-4 h-full">
              <div className="bg-accent/10 p-3 rounded-full">
                <Compass className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text mb-2">Create New Itinerary</h3>
                <p className="text-text/60">Generate a customized travel plan for your clients with AI-powered recommendations</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/settings">
            <div className="p-6 rounded-lg border border-accent/20 hover:bg-accent/5 transition-colors flex items-start space-x-4 h-full">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text mb-2">Manage API Keys</h3>
                <p className="text-text/60">Generate and manage your API access keys for seamless integration with your existing tools</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-text">Popular Destinations</h2>
          <Link href="/dashboard/destinations" className="text-accent hover:underline flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularDestinations.map((destination) => (
            <Card key={destination.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-lg text-text">{destination.name}</h3>
                <p className="text-text/60 text-sm mt-2">{destination.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-text/70">{destination.tripCount} itineraries created</span>
                  <Button variant="default" size="default" className="">
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src="https://tse1.mm.bing.net/th?id=OIP.rcmXeqCUOiCg54dfU4v9tgHaHa&pid=Api&P=0&h=180"
            alt="Client testimonial"
            className="rounded-full w-24 h-24 object-cover"
          />
          <div>
            <p className="italic text-text/80 text-lg mb-4">
              "This itinerary generator has transformed how our agency creates travel plans. We've seen a 40% increase in client satisfaction and saved countless hours of planning time."
            </p>
            <p className="font-medium text-text">Sarah Johnson</p>
            <p className="text-sm text-text/60">Travel Expert, Wanderlust Adventures</p>
          </div>
        </div>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold text-text mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "Created new itinerary", client: "John & Mary Smith", destination: "Tokyo, Japan", time: "2 hours ago" },
            { action: "Updated itinerary", client: "The Williams Family", destination: "Barcelona, Spain", time: "Yesterday" },
            { action: "Generated API key", client: "", destination: "", time: "2 days ago" },
            { action: "Created new itinerary", client: "Robert Johnson", destination: "Machu Picchu, Peru", time: "3 days ago" }
          ].map((activity, index) => (
            <div key={index} className="flex items-center py-2 border-b border-gray-100 last:border-0">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-text">
                  <span className="font-medium">{activity.action}</span>
                  {activity.client && <span> for {activity.client}</span>}
                  {activity.destination && <span> to {activity.destination}</span>}
                </p>
                <p className="text-sm text-text/60">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}