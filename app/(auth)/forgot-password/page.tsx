"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import API_URL from "@/constant/apiUrl";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await axios.post(`${API_URL}/users/forgot-password`, {
                email: values.email,
            });
            setSuccessMessage(response.data.message);
            setErrorMessage("");
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "An error occurred");
            setSuccessMessage("");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg p-8 space-y-3">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-text">Forgot Password</h1>
                    <p className="text-text/80">Enter your email to receive a password reset link.</p>
                </div>

                {successMessage && (
                    <div className="text-green-600 text-sm mb-4">{successMessage}</div>
                )}
                {errorMessage && (
                    <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                            Send Reset Link
                        </Button>
                    </form>
                </Form>
            </Card>
        </div>
    );
}