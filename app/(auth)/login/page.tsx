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
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email: values.email, password: values.password });
      console.log('response', response);
      if (response.data.success) {
        localStorage.setItem("itinerary:token", response.data.data.token);
        localStorage.setItem("itinerary:user", JSON.stringify(response.data.data));
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Failed",
          description: response.data.message,
        });
      }
    } catch (err) {
      console.log('error', err);
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
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text">Login</h1>
          <p className="text-text/80">Welcome back! Please login to your account.</p>
        </div>

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
            <Link href={'/register'}
              className="mt-2 flex justify-end text-sm text-accent"
            >don't have an account?</Link>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
              Login
            </Button>
          </form>
        </Form>

      </Card>
    </div>
  );
}