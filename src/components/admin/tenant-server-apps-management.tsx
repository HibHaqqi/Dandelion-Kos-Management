'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit, Globe } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Tenant {
  id: string;
  customer: {
    id: string;
    name: string;
    roomNumber: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TenantServerApp {
  id: string;
  tenantId: string;
  appId: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
  category: string;
  isActive: boolean;
  tenant: Tenant;
  updatedAt: Date;
}

export function TenantServerAppsManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [serverApps, setServerApps] = useState<TenantServerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<TenantServerApp | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    tenantId: '',
    appId: '',
    name: '',
    url: '',
    icon: '🌐',
    description: '',
    category: 'other',
    isActive: true,
  });

  const commonApps = [
    { id: 'jellyfin', name: 'Jellyfin', icon: '📺', category: 'media' },
    { id: 'homeassistant', name: 'Home Assistant', icon: '🏠', category: 'home' },
    { id: 'plex', name: 'Plex', icon: '🎬', category: 'media' },
    { id: 'emby', name: 'Emby', icon: '📺', category: 'media' },
    { id: 'nextcloud', name: 'Nextcloud', icon: '☁️', category: 'other' },
    { id: 'portainer', name: 'Portainer', icon: '🐳', category: 'other' },
  ];

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants/list');
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerApps = async (tenantId?: string) => {
    try {
      const url = tenantId
        ? `/api/admin/tenant-server-apps?tenantId=${tenantId}`
        : '/api/admin/tenant-server-apps';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setServerApps(data);
      }
    } catch (error) {
      console.error('Error fetching server apps:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/tenant-server-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchServerApps(formData.tenantId);
        setShowForm(false);
        setEditingApp(null);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save server app');
      }
    } catch (error) {
      console.error('Error saving server app:', error);
      alert('Failed to save server app');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tenant-server-apps?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        if (selectedTenant) {
          fetchServerApps(selectedTenant);
        } else {
          setServerApps(serverApps.filter((app) => app.id !== id));
        }
      }
    } catch (error) {
      console.error('Error deleting server app:', error);
      alert('Failed to delete server app');
    }
  };

  const handleEdit = (app: TenantServerApp) => {
    setEditingApp(app);
    setFormData({
      tenantId: app.tenantId,
      appId: app.appId,
      name: app.name,
      url: app.url,
      icon: app.icon,
      description: app.description || '',
      category: app.category,
      isActive: app.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      tenantId: selectedTenant,
      appId: '',
      name: '',
      url: '',
      icon: '🌐',
      description: '',
      category: 'other',
      isActive: true,
    });
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    fetchServerApps(tenantId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tenant Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTenant} onValueChange={handleTenantChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tenant to manage their server apps" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.customer.name} {tenant.customer.roomNumber && `(${tenant.customer.roomNumber})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Add Button */}
      {selectedTenant && (
        <div className="flex justify-end">
          <Button onClick={() => { setShowForm(true); setEditingApp(null); resetForm(); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Server App
          </Button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingApp ? 'Edit' : 'Add'} Server App</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="appId">App Type</Label>
                <Select
                  value={formData.appId}
                  onValueChange={(value) => {
                    const app = commonApps.find((a) => a.id === value);
                    setFormData({
                      ...formData,
                      appId: value,
                      name: app?.name || formData.name,
                      icon: app?.icon || formData.icon,
                      category: app?.category || formData.category,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or custom app" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonApps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.icon} {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Jellyfin"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g., http://192.168.1.100:8096"
                  required
                />
              </div>

              <div>
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🌐"
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Media streaming server"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingApp ? 'Update' : 'Add'} Server App
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingApp(null); resetForm(); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!selectedTenant ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Please select a tenant above to view and manage their server apps.
          </CardContent>
        </Card>
      ) : serverApps.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No server apps configured for this tenant. Click "Add Server App" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configured Server Apps ({serverApps.length})
          </h3>
          {serverApps.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{app.icon}</span>
                      <span className="font-medium text-lg">{app.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {app.category}
                      </span>
                      {!app.isActive && (
                        <span className="text-xs text-gray-500">(Inactive)</span>
                      )}
                    </div>
                    {app.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {app.description}
                      </p>
                    )}
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      {app.url}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(app)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Server App?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{app.name}" for this tenant? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(app.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
