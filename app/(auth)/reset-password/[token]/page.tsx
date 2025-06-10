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
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = useParams();

    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!token) {
            alert("Invalid or missing token.");
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/users/reset-password/${token}`, { password: values.password });
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Password changed successfully",
                });
                router.push("/login");
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed",
                    description: response.data.message,
                });
            }
        } catch (err) {
            console.error("Error resetting password:", err);
            alert("Failed to reset password. Please try again.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg p-8 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-text">Reset Password</h1>
                    <p className="text-text/80">Enter your new password below.</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                            Reset Password
                        </Button>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
