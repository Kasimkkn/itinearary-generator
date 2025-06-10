"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import API_URL from "@/constant/apiUrl";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Hash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

// Create user form schema
const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin"], {
        required_error: "Please select a role",
    }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [updatedName, setUpdatedName] = useState("");
    const router = useRouter();

    // Initialize form with react-hook-form
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "user",
        },
        mode: "onChange", // Enable validation on change
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isCreateModalOpen) {
            form.reset();
        }
    }, [isCreateModalOpen, form]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("itinerary:token");
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setUsers(response.data.data);
            } else {
                console.error("Error fetching users:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            router.push("/login");
        }
    };

    const handleCreateUser = async (values: CreateUserFormValues) => {
        try {
            const token = localStorage.getItem("itinerary:token");
            const response = await axios.post(
                `${API_URL}/users/create`,
                { ...values, isCreatedByAdmin: true },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data.success) {
                toast({ title: "Success", description: "User created successfully!" });
                fetchUsers();
                setIsCreateModalOpen(false);
                form.reset();
            } else {
                console.error("Error creating user:", response.data.message);
                toast({ title: "Error", description: response.data.message, variant: "destructive" });
                setIsCreateModalOpen(false);
            }
        } catch (error: any) {
            console.error("Error creating user:", error);
            const errorMessage = error.response?.data?.message || "Failed to create user.";
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        try {
            const token = localStorage.getItem("itinerary:token");
            await axios.put(`${API_URL}/users/${selectedUser._id}`, { name: updatedName }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "Success", description: "User updated successfully!" });
            fetchUsers();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            const token = localStorage.getItem("itinerary:token");
            await axios.delete(`${API_URL}/users/${selectedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "Success", description: "User deleted successfully!" });
            fetchUsers();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
        }
    };

    return (
        <div className="">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-center">Manage Users</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>Create User</Button>
            </div>
            <Card className="">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="w-10 text-center"><Hash size={16} /></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user._id}>
                                <TableCell className="text-center font-semibold">{index + 1}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell className="flex gap-2 justify-center">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="p-2"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setUpdatedName(user.name);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="p-2"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user details</DialogDescription>
                    <Input value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateUser}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Modal with Form Validation */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                setIsCreateModalOpen(open);
                if (!open) form.reset();
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>Enter user details</DialogDescription>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full name" {...field} />
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
                                            <Input placeholder="Email address" type="email" {...field} />
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
                                            <Input placeholder="Password" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;