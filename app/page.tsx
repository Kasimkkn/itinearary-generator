"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { mockAuth } from "@/lib/auth";

export default function Home() {

  useEffect(() => {
    mockAuth.checkAuth();
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-text">Welcome to Travel Planner</h1>
          <p className="text-lg text-text/80">Create beautiful travel itineraries for your clients</p>
        </div>

        <div className="space-y-4 flex flex-col">
          <Link href="/register">
            <Button className="w-full bg-accent hover:bg-accent/90 text-white">
              Register
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button className="w-full bg-accent hover:bg-accent/90 text-white">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}