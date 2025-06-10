"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Copy, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ApiKey {
  id: string;
  userId: string;
  key: string;
  name: string;
  active: boolean;
  lastUsed: Date | null;
  createdAt: Date;
}

interface ApiKeyService {
  baseUrl: string;
  getAuthHeaders(): Promise<{ headers: { Authorization: string } }>;
  createApiKey(name: string): Promise<{ data: ApiKey }>;
  getUserApiKeys(): Promise<{ data: ApiKey[] }>;
  toggleApiKeyStatus(keyId: string, activate: boolean): Promise<{ data: ApiKey }>;
  deleteApiKey(keyId: string): Promise<void>;
}

const apiKeyService: ApiKeyService = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",

  async getAuthHeaders() {
    const token = localStorage.getItem("itinerary:token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  },

  async createApiKey(name: string) {
    const headers = await this.getAuthHeaders();
    const response = await axios.post(`${this.baseUrl}/apikeys`, { name }, headers);
    return response.data;
  },

  async getUserApiKeys() {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${this.baseUrl}/apikeys`, headers);
    return response.data;
  },

  async toggleApiKeyStatus(keyId: string, activate: boolean) {
    const headers = await this.getAuthHeaders();
    const endpoint = activate ? 'activate' : 'deactivate';
    const response = await axios.put(`${this.baseUrl}/apikeys/${keyId}/${endpoint}`, {}, headers);
    return response.data;
  },

  async deleteApiKey(keyId: string) {
    const headers = await this.getAuthHeaders();
    const response = await axios.delete(`${this.baseUrl}/apikeys/${keyId}`, headers);
    return response.data;
  },
};

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingKeyId, setProcessingKeyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeyService.getUserApiKeys();
      setApiKeys(response.data || []);

      const storedKeyId = localStorage.getItem("itinerary:activeKeyId");
      if (storedKeyId) {
        const activeKey = response.data.find(key => key.id === storedKeyId && key.active);
        if (!activeKey) {
          localStorage.removeItem("itinerary:activeKeyId");
          localStorage.removeItem("itinerary:apiKey");
        }
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiKeyService.createApiKey(newKeyName);
      const newKey = response.data;

      const updatedKeys = await deactivateOtherKeys(newKey.id);

      await apiKeyService.toggleApiKeyStatus(newKey.id, true);

      setApiKeys(updatedKeys.map(key =>
        key.id === newKey.id ? { ...newKey, active: true } : key
      ));

      setSelectedKey({ ...newKey, active: true });
      setShowKey(true);

      localStorage.setItem("itinerary:apiKey", newKey.key);
      localStorage.setItem("itinerary:activeKeyId", newKey.id);

      toast({
        title: "Success",
        description: "New API key generated and activated successfully",
      });
      setIsDialogOpen(false);
      setNewKeyName("");
      fetchApiKeys();
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const deactivateOtherKeys = async (exceptKeyId: string) => {
    try {
      const activeKeys = apiKeys.filter(key => key.active && key.id !== exceptKeyId);

      if (activeKeys.length === 0) {
        return apiKeys;
      }

      await Promise.all(
        activeKeys.map(key => apiKeyService.toggleApiKeyStatus(key.id, false))
      );

      return apiKeys.map(key => ({
        ...key,
        active: key.id === exceptKeyId ? key.active : false
      }));
    } catch (error) {
      console.error("Error deactivating other keys:", error);
      throw error;
    }
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      setProcessingKeyId(keyId);
      const newStatus = !currentStatus;

      if (newStatus) {
        const updatedKeys = await deactivateOtherKeys(keyId);
        setApiKeys(updatedKeys);

        await apiKeyService.toggleApiKeyStatus(keyId, true);

        setApiKeys(prev =>
          prev.map(key => (key.id === keyId ? { ...key, active: true } : key))
        );

        const activeKey = apiKeys.find(key => key.id === keyId);
        if (activeKey) {
          localStorage.setItem("itinerary:apiKey", activeKey.key);
          localStorage.setItem("itinerary:activeKeyId", keyId);
        }

        if (selectedKey && selectedKey.id === keyId) {
          setSelectedKey({ ...selectedKey, active: true });
        }
      } else {
        await apiKeyService.toggleApiKeyStatus(keyId, false);

        setApiKeys(prev =>
          prev.map(key => (key.id === keyId ? { ...key, active: false } : key))
        );

        const storedKeyId = localStorage.getItem("itinerary:activeKeyId");
        if (storedKeyId === keyId) {
          localStorage.removeItem("itinerary:activeKeyId");
          localStorage.removeItem("itinerary:apiKey");
        }

        if (selectedKey && selectedKey.id === keyId) {
          setSelectedKey({ ...selectedKey, active: false });
        }
      }

      toast({
        title: "Success",
        description: `API key ${newStatus ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      console.error("Error toggling API key status:", error);
      toast({
        title: "Error",
        description: `Failed to ${currentStatus ? "deactivate" : "activate"} API key`,
        variant: "destructive",
      });

      fetchApiKeys();
    } finally {
      setProcessingKeyId(null);
    }
  };

  const confirmDeleteKey = (key: ApiKey) => {
    setKeyToDelete(key);
    setIsDeleteDialogOpen(true);
  };

  const deleteKey = async () => {
    if (!keyToDelete) return;

    try {
      setLoading(true);
      await apiKeyService.deleteApiKey(keyToDelete.id);

      setApiKeys(prev => prev.filter(key => key.id !== keyToDelete.id));

      if (selectedKey && selectedKey.id === keyToDelete.id) {
        setSelectedKey(null);
      }

      const storedKeyId = localStorage.getItem("itinerary:activeKeyId");
      if (storedKeyId === keyToDelete.id) {
        localStorage.removeItem("itinerary:activeKeyId");
        localStorage.removeItem("itinerary:apiKey");
      }

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-text">Settings</h1>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text">API Key Management</h2>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Create New Key
          </Button>
        </div>

        {selectedKey && (
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{selectedKey.name}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedKey(null)}
              >
                <X size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={showKey ? selectedKey.key : '•'.repeat(32)}
                readOnly
                className="font-mono"
              />
              <Button
                onClick={() => setShowKey(!showKey)}
                variant="outline"
                size="icon"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button
                onClick={() => copyApiKey(selectedKey.key)}
                variant="outline"
                size="icon"
              >
                <Copy size={16} />
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Created: {new Date(selectedKey.createdAt).toLocaleString()}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading && !apiKeys.length ? (
            <div className="text-center py-4">Loading API keys...</div>
          ) : apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => {
                  const isProcessing = processingKeyId === key.id;
                  return (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">
                        {key.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={key.active}
                            onCheckedChange={() => toggleKeyStatus(key.id, key.active)}
                            disabled={isProcessing || loading}
                          />
                          <span className={key.active ? "text-green-600" : "text-red-600"}>
                            {isProcessing ? "Processing..." : key.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(key.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedKey(key)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => confirmDeleteKey(key)}
                            disabled={isProcessing || loading}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No API keys found. Create your first API key to get started.
            </div>
          )}
        </div>
      </Card>
      <Card className="p-4 space-y-2">
        <Button>
          <Link href={"/forgot-password"}>Change Password</Link>
        </Button>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Give your API key a descriptive name to help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="key-name">API Key Name</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., first-api-key, my-secret-key"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={generateApiKey}
              disabled={loading || !newKeyName.trim()}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API key "{keyToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteKey}
              disabled={loading}
              variant="destructive"
            >
              {loading ? "Deleting..." : "Delete Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}