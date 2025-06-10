"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { Compass, Home, Map, Menu, Settings, X, Users } from "lucide-react";
import Link from "next/link";

import API_URL from "@/constant/apiUrl";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: any;
  user: any;
}
const Sidebar = ({ isOpen, setIsOpen, user }: SidebarProps) => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/generate", label: "Generate Itinerary", icon: Map },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/compare", label: "Compare", icon: Compass },
    { href: "/dashboard/itineraries", label: "Itineraries", icon: Map },
  ];

  if (user?.role === "admin") {
    links.push({ href: "/dashboard/create-user", label: "Create", icon: Users });
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-2 right-2 z-50 p-2 text-accent rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }  lg:w-64 z-40`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-accent mb-6">Travel Planner</h2>
          <nav className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${pathname === href
                  ? "bg-accent text-white"
                  : "text-text hover:bg-accent/10"
                  }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("itinerary:token");
        if (!token) {
          console.log("No token found, redirecting to login...");
          router.push("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUser(response.data.data);
        }

      } catch (err) {
        console.error("Error fetching user:", err);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);


  if (!user) return null;

  return (
    <div className="flex bg-[#F0F4FF]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
      <main className="flex-1 p-6 lg:pl-72">{children}</main>
    </div>
  );
}
