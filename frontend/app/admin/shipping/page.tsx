'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Building2,
  AlertCircle
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { shippingService } from '@/service/shippingService';

interface City {
  _id?: string;
  name: string;
  shippingCharge: number;
  isActive: boolean;
}

interface Province {
  _id: string;
  name: string;
  cities: City[];
  isActive: boolean;
}

export default function ShippingPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvince, setEditingProvince] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState<{ provinceId: string; cityId: string } | null>(null);
  const [selectedProvinceForCity, setSelectedProvinceForCity] = useState<string>('');

  // Form states
  const [newProvinceName, setNewProvinceName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newCityCharge, setNewCityCharge] = useState('');
  const [editProvinceName, setEditProvinceName] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editCityCharge, setEditCityCharge] = useState('');
  const [editCityActive, setEditCityActive] = useState(true);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const response = await shippingService.getAllProvinces();
      setProvinces(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch provinces');
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvince = async () => {
    if (!newProvinceName.trim()) {
      toast.error('Province name is required');
      return;
    }

    try {
      const response = await shippingService.createProvince({ name: newProvinceName.trim() });
      setProvinces(prev => [...prev, response.data]);
      setNewProvinceName('');
      toast.success('Province created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create province');
    }
  };

  const handleUpdateProvince = async (provinceId: string) => {
    if (!editProvinceName.trim()) {
      toast.error('Province name is required');
      return;
    }

    try {
      const response = await shippingService.updateProvince(provinceId, { name: editProvinceName.trim() });
      setProvinces(prev => prev.map(p => p._id === provinceId ? response.data : p));
      setEditingProvince(null);
      setEditProvinceName('');
      toast.success('Province updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update province');
    }
  };

  const handleDeleteProvince = async (provinceId: string) => {
    try {
      await shippingService.deleteProvince(provinceId);
      setProvinces(prev => prev.filter(p => p._id !== provinceId));
      toast.success('Province deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete province');
    }
  };

  const handleAddCity = async () => {
    if (!selectedProvinceForCity) {
      toast.error('Please select a province');
      return;
    }
    if (!newCityName.trim()) {
      toast.error('City name is required');
      return;
    }
    if (!newCityCharge || Number(newCityCharge) <= 0) {
      toast.error('Valid shipping charge is required');
      return;
    }

    try {
      const response = await shippingService.addCityToProvince(selectedProvinceForCity, {
        name: newCityName.trim(),
        shippingCharge: Number(newCityCharge)
      });
      setProvinces(prev => prev.map(p => p._id === selectedProvinceForCity ? response.data : p));
      setNewCityName('');
      setNewCityCharge('');
      setSelectedProvinceForCity('');
      toast.success('City added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add city');
    }
  };

  const handleUpdateCity = async (provinceId: string, cityId: string) => {
    if (!editCityName.trim()) {
      toast.error('City name is required');
      return;
    }
    if (!editCityCharge || Number(editCityCharge) <= 0) {
      toast.error('Valid shipping charge is required');
      return;
    }

    try {
      const response = await shippingService.updateCityShippingCharge(provinceId, cityId, {
        name: editCityName.trim(),
        shippingCharge: Number(editCityCharge),
        isActive: editCityActive
      });
      setProvinces(prev => prev.map(p => p._id === provinceId ? response.data : p));
      setEditingCity(null);
      setEditCityName('');
      setEditCityCharge('');
      setEditCityActive(true);
      toast.success('City updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update city');
    }
  };

  const handleDeleteCity = async (provinceId: string, cityId: string) => {
    try {
      await shippingService.deleteCityFromProvince(provinceId, cityId);
      setProvinces(prev => prev.map(p => {
        if (p._id === provinceId) {
          return {
            ...p,
            cities: p.cities.filter(c => c._id !== cityId)
          };
        }
        return p;
      }));
      toast.success('City deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete city');
    }
  };

  const startEditProvince = (province: Province) => {
    setEditingProvince(province._id);
    setEditProvinceName(province.name);
  };

  const startEditCity = (provinceId: string, city: City) => {
    setEditingCity({ provinceId, cityId: city._id || city.name });
    setEditCityName(city.name);
    setEditCityCharge(city.shippingCharge.toString());
    setEditCityActive(city.isActive);
  };

  const cancelEditProvince = () => {
    setEditingProvince(null);
    setEditProvinceName('');
  };

  const cancelEditCity = () => {
    setEditingCity(null);
    setEditCityName('');
    setEditCityCharge('');
    setEditCityActive(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading shipping data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Management</h1>
          <p className="text-muted-foreground">Manage provinces, cities, and shipping charges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Province Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Add Province
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="province-name">Province Name</Label>
              <Input
                id="province-name"
                placeholder="Enter province name"
                value={newProvinceName}
                onChange={(e) => setNewProvinceName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProvince()}
              />
            </div>
            <Button 
              onClick={handleCreateProvince}
              disabled={!newProvinceName.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Province
            </Button>
          </CardContent>
        </Card>

        {/* Add City Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Add City
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="province-select">Select Province</Label>
              <select
                id="province-select"
                className="w-full p-2 border border-input rounded-md bg-background"
                value={selectedProvinceForCity}
                onChange={(e) => setSelectedProvinceForCity(e.target.value)}
              >
                <option value="">Choose a province</option>
                {provinces.map(province => (
                  <option key={province._id} value={province._id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-name">City Name</Label>
              <Input
                id="city-name"
                placeholder="Enter city name"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-charge">Shipping Charge (Rs.)</Label>
              <Input
                id="city-charge"
                type="number"
                placeholder="Enter shipping charge"
                value={newCityCharge}
                onChange={(e) => setNewCityCharge(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
              />
            </div>
            <Button 
              onClick={handleAddCity}
              disabled={!selectedProvinceForCity || !newCityName.trim() || !newCityCharge}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add City
            </Button>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Provinces:</span>
              <Badge variant="secondary">{provinces.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Cities:</span>
              <Badge variant="secondary">
                {provinces.reduce((total, province) => total + province.cities.length, 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Cities:</span>
              <Badge variant="secondary">
                {provinces.reduce((total, province) => 
                  total + province.cities.filter(city => city.isActive).length, 0
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Provinces List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Provinces & Cities</h2>
        
        {provinces.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No provinces yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by adding your first province above
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {provinces.map(province => (
              <Card key={province._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      {editingProvince === province._id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editProvinceName}
                            onChange={(e) => setEditProvinceName(e.target.value)}
                            className="w-48"
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateProvince(province._id)}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateProvince(province._id)}
                            disabled={!editProvinceName.trim()}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelEditProvince}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <CardTitle className="flex items-center gap-2">
                          {province.name}
                          <Badge variant="outline">
                            {province.cities.length} cities
                          </Badge>
                        </CardTitle>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingProvince !== province._id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditProvince(province)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={province.cities.length > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Province</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{province.name}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProvince(province._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {province.cities.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Cannot delete province with existing cities
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {province.cities.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No cities in this province yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {province.cities.map(city => (
                        <div key={city._id || city.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {editingCity?.provinceId === province._id && editingCity?.cityId === (city._id || city.name) ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editCityName}
                                  onChange={(e) => setEditCityName(e.target.value)}
                                  className="w-32"
                                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateCity(province._id, city._id || city.name)}
                                />
                                <Input
                                  type="number"
                                  value={editCityCharge}
                                  onChange={(e) => setEditCityCharge(e.target.value)}
                                  className="w-24"
                                  placeholder="Charge"
                                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateCity(province._id, city._id || city.name)}
                                />
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={editCityActive}
                                    onCheckedChange={setEditCityActive}
                                  />
                                  <Label className="text-sm">Active</Label>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateCity(province._id, city._id || city.name)}
                                  disabled={!editCityName.trim() || !editCityCharge}
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelEditCity}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{city.name}</span>
                                <Badge variant="secondary">
                                  Rs. {city.shippingCharge}
                                </Badge>
                                <Badge variant={city.isActive ? "default" : "secondary"}>
                                  {city.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {editingCity?.provinceId !== province._id || editingCity?.cityId !== (city._id || city.name) ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditCity(province._id, city)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete City</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{city.name}"? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCity(province._id, city._id || city.name)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 