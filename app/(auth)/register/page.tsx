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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await axios.post(`${API_URL}/users/create`, values);
            console.log('response', response);
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Registration successful! Check your email for verification.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed",
                    description: response.data.message,
                });
            }
        } catch (err) {
            console.error("Error registering:", err);
        } finally {
            form.resetField("email")
            form.resetField("password")
            form.resetField("name")
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("itinerary:token");
        if (token) {
            router.push("/dashboard");
        }
    })
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg p-8 space-y-3">
                <h1 className="text-3xl font-bold text-text">Register</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end items-center">
                            <Link
                                href={"/login"}
                                className="flex justify-end text-sm text-accent"
                            >have an account? or verfied</Link>
                        </div>
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                            Register
                        </Button>
                    </form>
                </Form>
            </Card>
        </div>
    );
}