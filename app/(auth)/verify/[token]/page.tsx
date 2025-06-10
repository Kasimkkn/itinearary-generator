"use client";
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import API_URL from "@/constant/apiUrl";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyPage() {
    const { token } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState("click here to verify");

    async function verifyUser() {
        if (!token) return setStatus("Invalid verification link.");
        try {
            const response = await axios.get(`${API_URL}/users/verify/${token}`);
            if (response.data.success) {
                setStatus("Verification successful! Redirecting to login...");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setStatus(response.data.message)
            }
        } catch (err) {
            console.error("Verification failed:", err);
            setStatus("Verification failed or link expired.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-8 space-y-4 text-center">
                <h1 className="text-3xl font-bold text-text">Email Verification</h1>
                <p>{status}</p>
                <Button
                    className="w-full"
                    onClick={verifyUser}
                >verify</Button>
            </Card>
        </div>
    );
}
