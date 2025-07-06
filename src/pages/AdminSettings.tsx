import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { BusinessSettings } from '../api/services/settingsService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout';
import { Loader2, Save, Pencil, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const AdminSettings: React.FC = () => {
  const { 
    settings, 
    isLoading, 
    isUpdating, 
    error, 
    saveBusinessSettings
  } = useSettings();
  
  const [formData, setFormData] = useState<BusinessSettings | null>(null);
  const [customMethods, setCustomMethods] = useState<string[]>([]);
  
  // List of common currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'NZD', name: 'New Zealand Dollar (NZ$)' },
    { code: 'SGD', name: 'Singapore Dollar (S$)' },
  ];
  
  // List of common timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Edmonton',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];
  
  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      // If the API doesn't return the new fields, set defaults
      const updatedSettings = {
        ...settings,
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'UTC',
        accept_cash: settings.accept_cash !== undefined ? settings.accept_cash : true,
        accept_card: settings.accept_card !== undefined ? settings.accept_card : true,
        accept_mobile: settings.accept_mobile !== undefined ? settings.accept_mobile : false,
      };
      setFormData(updatedSettings);
    }
  }, [settings]);
  
  // After settings are loaded update customMethods
  useEffect(() => {
    if (!settings) return;
    let arr: string[] = [];
    if (Array.isArray(settings.custom_payment_methods)) {
      arr = settings.custom_payment_methods;
    } else if (typeof settings.custom_payment_methods === 'string') {
      try {
        const parsed = JSON.parse(settings.custom_payment_methods);
        if (Array.isArray(parsed)) arr = parsed;
      } catch {
        // ignore parse errors
      }
    }
    setCustomMethods(arr);
  }, [settings]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      if (type === 'checkbox') {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked
        };
      } else if (type === 'number') {
        return {
          ...prev,
          [name]: parseFloat(value)
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: checked
      };
    });
  };
  
  // Add handler functions
  const handleAddCustomMethod = (name: string) => {
    if (!name.trim()) return;
    if (customMethods.includes(name.trim().toLowerCase())) return;
    setCustomMethods(prev => [...prev, name.trim()]);
  };
  const handleEditCustomMethod = (index: number, name: string) => {
    setCustomMethods(prev => prev.map((m, i)=> i===index ? name.trim() : m));
  };
  const handleDeleteCustomMethod = (index:number) => {
    setCustomMethods(prev => prev.filter((_,i)=> i!==index));
  };
  
  // Handle save from header action (no form submission event)
  const handleSaveClick = async (e?: React.FormEvent) => {
    // Prevent default form submission if called from <form onSubmit>
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (formData) {
      const payload: BusinessSettings = {
        ...formData,
        custom_payment_methods: customMethods,
      };
      await saveBusinessSettings(payload);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Settings"
        description="Configure your business settings and preferences"
        action={{
          label: isUpdating ? 'Saving...' : 'Save Settings',
          onClick: handleSaveClick,
          icon: isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          ),
          disabled: isUpdating,
        }}
      />
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {formData && (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6 overflow-x-auto whitespace-nowrap gap-2 px-1">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="payment">Payment Options</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSaveClick}>
            <TabsContent value="general" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Business Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => handleSelectChange('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => handleSelectChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone} value={timezone}>
                              {timezone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        name="tax_rate"
                        value={formData.tax_rate}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slot_duration">Slot Duration (minutes)</Label>
                      <Input
                        id="slot_duration"
                        type="number"
                        name="slot_duration"
                        value={formData.slot_duration}
                        onChange={handleInputChange}
                        min="5"
                        step="5"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default_commission">Default Commission (%)</Label>
                      <Input
                        id="default_commission"
                        type="number"
                        name="default_commission"
                        value={formData.default_commission}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_tips"
                        checked={formData.allow_tips}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('allow_tips', checked === true)
                        }
                      />
                      <Label htmlFor="allow_tips">Allow Tips</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_discounts"
                        checked={formData.allow_discounts}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('allow_discounts', checked === true)
                        }
                      />
                      <Label htmlFor="allow_discounts">Allow Discounts</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-medium">Custom Payment Methods</h3>
                    {customMethods.length===0 && <p className="text-sm text-muted-foreground">No custom methods added.</p>}
                    {customMethods.map((method,idx)=>(
                      <div key={method+idx} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{method}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={()=>{
                            const newName = prompt('Edit payment method', method);
                            if(newName!==null) handleEditCustomMethod(idx,newName);
                          }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={()=>handleDeleteCustomMethod(idx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="mt-2" onClick={()=>{
                      const name = prompt('New payment method name');
                      if(name) handleAddCustomMethod(name);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      )}
    </div>
  );
};

export default AdminSettings; 