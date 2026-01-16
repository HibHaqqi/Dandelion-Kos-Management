'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Wifi, Shield, Phone, Key, Plus, Trash2, Edit } from 'lucide-react';
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

interface BuildingInfo {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isActive: boolean;
  user?: { id: string; name: string };
}

interface RoomInfo {
  id: string;
  roomNumber: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  user?: { id: string; name: string };
}

interface Room {
  roomNumber: string;
  status: string;
}

export function InfoManagement() {
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentViewRoom, setCurrentViewRoom] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'building' | 'room'>('building');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BuildingInfo | RoomInfo | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: 'general',
    description: '',
    roomNumber: '',
    isActive: true,
  });

  useEffect(() => {
    fetchBuildingInfo();
    fetchRooms();
  }, []);

  // Auto-load first room when switching to room tab
  useEffect(() => {
    if (activeTab === 'room' && rooms.length > 0 && !currentViewRoom) {
      // Auto-select the first room
      const firstRoom = rooms[0].roomNumber;
      console.log('🔄 Auto-loading first room:', firstRoom);
      fetchRoomInfo(firstRoom);
    }
  }, [activeTab, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms/list');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchBuildingInfo = async () => {
    try {
      const response = await fetch('/api/admin/building-info');
      if (response.ok) {
        const data = await response.json();
        setBuildingInfo(data);
      }
    } catch (error) {
      console.error('Error fetching building info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomInfo = async (roomNumber: string) => {
    try {
      console.log('📋 Fetching room info for:', roomNumber);
      setCurrentViewRoom(roomNumber); // Set the current viewed room
      const response = await fetch(`/api/admin/room-info?roomNumber=${roomNumber}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Room info fetched:', data);
        setRoomInfo(data);
      } else {
        console.error('❌ Failed to fetch room info:', response.status);
      }
    } catch (error) {
      console.error('Error fetching room info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = activeTab === 'building' ? '/api/admin/building-info' : '/api/admin/room-info';
    const payload = activeTab === 'building'
      ? { ...formData, isActive: formData.isActive }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (activeTab === 'building') {
          fetchBuildingInfo();
        } else {
          // Store room number before resetting form
          const roomNumber = formData.roomNumber;
          fetchRoomInfo(roomNumber);
        }
        setShowForm(false);
        setEditingItem(null);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save information');
      }
    } catch (error) {
      console.error('Error saving info:', error);
      alert('Failed to save information: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = async (key: string, roomNumber?: string) => {
    const endpoint = roomNumber
      ? `/api/admin/room-info?roomNumber=${roomNumber}&key=${key}`
      : `/api/admin/building-info?key=${key}`;

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        if (activeTab === 'building') {
          setBuildingInfo(buildingInfo.filter((item) => item.key !== key));
        } else {
          setRoomInfo(roomInfo.filter((item) => item.key !== key));
        }
      }
    } catch (error) {
      console.error('Error deleting info:', error);
      alert('Failed to delete information');
    }
  };

  const handleEdit = (item: BuildingInfo | RoomInfo) => {
    setEditingItem(item);
    setFormData({
      key: item.key,
      value: item.value,
      category: item.category,
      description: item.description || '',
      roomNumber: 'roomNumber' in item ? item.roomNumber : '',
      isActive: 'isActive' in item ? item.isActive : true,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      category: 'general',
      description: '',
      roomNumber: '',
      isActive: true,
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      general: <Wifi className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      contact: <Phone className="h-4 w-4" />,
      access: <Key className="h-4 w-4" />,
    };
    return icons[category] || null;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'building' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('building');
            setShowForm(false);
            setEditingItem(null);
            resetForm();
          }}
        >
          Building Information
        </Button>
        <Button
          variant={activeTab === 'room' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('room');
            setShowForm(false);
            setEditingItem(null);
            resetForm();
          }}
        >
          Room Information
        </Button>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        {activeTab === 'room' && (
          <div className="flex items-center gap-2">
            <Label htmlFor="viewRoomSelect">View Room:</Label>
            <Select
              value={currentViewRoom}
              onValueChange={(value) => {
                if (value) {
                  fetchRoomInfo(value);
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select room to view" />
              </SelectTrigger>
              <SelectContent>
                {rooms.length === 0 ? (
                  <SelectItem value="" disabled>
                    No rooms available
                  </SelectItem>
                ) : (
                  rooms.map((room) => (
                    <SelectItem key={room.roomNumber} value={room.roomNumber}>
                      {room.roomNumber} {room.status === 'occupied' && '🏠'}
                      {room.status === 'vacant' && '🔑'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          className={activeTab === 'room' ? '' : 'ml-auto'}
          onClick={() => { setShowForm(true); setEditingItem(null); resetForm(); }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'building' ? 'Building' : 'Room'} Information
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit' : 'Add'} Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'room' && (
                <div>
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Select
                    value={formData.roomNumber}
                    onValueChange={(value) => setFormData({ ...formData, roomNumber: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.length === 0 ? (
                        <SelectItem value="" disabled>
                          No rooms available
                        </SelectItem>
                      ) : (
                        rooms.map((room) => (
                          <SelectItem key={room.roomNumber} value={room.roomNumber}>
                            {room.roomNumber} {room.status === 'occupied' && '🏠'}
                            {room.status === 'vacant' && '🔑'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {rooms.find(r => r.roomNumber === formData.roomNumber)?.status === 'occupied'
                      ? '🏠 Occupied'
                      : rooms.find(r => r.roomNumber === formData.roomNumber)?.status === 'vacant'
                      ? '🔑 Vacant'
                      : ''}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., wifi_password, gate_code"
                  required
                />
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {activeTab === 'building' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingItem ? 'Update' : 'Add'} Information
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {activeTab === 'room' && currentViewRoom && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Room {currentViewRoom} Information
            </h3>
            <span className="text-sm text-gray-500">
              {roomInfo.length} {roomInfo.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}
        {activeTab === 'building' ? (
          buildingInfo.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No building information yet. Click "Add Building Information" to get started.
              </CardContent>
            </Card>
          ) : (
            buildingInfo.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(item.category)}
                        <span className="font-medium text-lg">{item.key}</span>
                        {!item.isActive && (
                          <span className="text-xs text-gray-500">(Inactive)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {item.description}
                      </p>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {item.value}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
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
                            <AlertDialogTitle>Delete Information?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{item.key}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.key)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          roomInfo.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No room information found for the selected room. Add room-specific information using the form above.
                {currentViewRoom && <p className="mt-2 text-sm">Currently viewing: {currentViewRoom}</p>}
              </CardContent>
            </Card>
          ) : (
            (() => {
              console.log('🎨 Rendering roomInfo list, items:', roomInfo.length);
              return roomInfo.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(item.category)}
                          <span className="font-medium text-lg">{item.key}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            Room: {item.roomNumber}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {item.description}
                        </p>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {item.value}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
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
                              <AlertDialogTitle>Delete Information?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.key}" from room {item.roomNumber}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.key, item.roomNumber)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ));
            })()
          )
        )}
      </div>
    </div>
  );
}
