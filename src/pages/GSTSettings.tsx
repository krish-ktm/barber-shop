import React, { useState } from 'react';
import { Save, Plus, Trash, PlusCircle, MinusCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { gstRatesData } from '@/mocks';
import { GSTRate, GSTComponent } from '@/types';
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

export const GSTSettings: React.FC = () => {
  const { toast } = useToast();
  const [gstRates, setGstRates] = useState<GSTRate[]>(gstRatesData);

  // Function to calculate total rate from components
  const calculateTotalRate = (components: GSTComponent[]): number => {
    return parseFloat(
      components.reduce((sum, comp) => sum + comp.rate, 0).toFixed(2)
    );
  };

  const handleAddRate = () => {
    const newRate: GSTRate = {
      id: Date.now().toString(),
      name: 'New GST Rate',
      components: [
        { id: `comp-${Date.now()}`, name: 'GST', rate: 0 }
      ],
      isActive: false,
      totalRate: 0
    };
    setGstRates([...gstRates, newRate]);
  };

  const handleDeleteRate = (id: string) => {
    setGstRates(gstRates.filter(rate => rate.id !== id));
    toast({
      title: 'GST rate deleted',
      description: 'The GST rate has been removed successfully.',
    });
  };

  const handleUpdateRate = (id: string, field: keyof GSTRate, value: string | number | boolean | GSTComponent[]) => {
    setGstRates(gstRates.map(rate => {
      if (rate.id === id) {
        const updatedRate = { ...rate, [field]: value };
        
        // Recalculate total rate if components were updated
        if (field === 'components') {
          const components = value as GSTComponent[];
          updatedRate.totalRate = calculateTotalRate(components);
        }
        
        return updatedRate;
      }
      return rate;
    }));
  };

  const handleAddComponent = (rateId: string) => {
    const rate = gstRates.find(r => r.id === rateId);
    if (!rate) return;

    const newComponent: GSTComponent = {
      id: `comp-${Date.now()}`,
      name: 'New Component',
      rate: 0
    };

    const updatedComponents = [...rate.components, newComponent];
    handleUpdateRate(rateId, 'components', updatedComponents);
  };

  const handleUpdateComponent = (rateId: string, componentId: string, field: keyof GSTComponent, value: string | number) => {
    const rate = gstRates.find(r => r.id === rateId);
    if (!rate) return;

    const updatedComponents = rate.components.map(comp => 
      comp.id === componentId ? { ...comp, [field]: value } : comp
    );
    
    handleUpdateRate(rateId, 'components', updatedComponents);
  };

  const handleDeleteComponent = (rateId: string, componentId: string) => {
    const rate = gstRates.find(r => r.id === rateId);
    if (!rate) return;
    
    // Don't allow deleting the last component
    if (rate.components.length <= 1) {
      toast({
        title: 'Cannot delete component',
        description: 'A GST rate must have at least one component.',
        variant: 'destructive',
      });
      return;
    }

    const updatedComponents = rate.components.filter(comp => comp.id !== componentId);
    handleUpdateRate(rateId, 'components', updatedComponents);
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    toast({
      title: 'Settings saved',
      description: 'GST settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Settings"
        description="Configure GST rates for your services"
        action={{
          label: "Save Changes",
          onClick: handleSave,
          icon: <Save className="h-4 w-4 mr-2" />,
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>GST Rates</CardTitle>
            <Button onClick={handleAddRate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {gstRates.map((rate) => (
              <div
                key={rate.id}
                className="flex flex-col gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="grid gap-2">
                      <Label>Rate Name</Label>
                      <Input
                        value={rate.name}
                        onChange={(e) => handleUpdateRate(rate.id, 'name', e.target.value)}
                        placeholder="Enter rate name"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rate.isActive}
                        onCheckedChange={(checked) => {
                          // If setting this rate to active, deactivate others
                          if (checked) {
                            setGstRates(gstRates.map(r => ({
                              ...r,
                              isActive: r.id === rate.id
                            })));
                          } else {
                            handleUpdateRate(rate.id, 'isActive', false);
                          }
                        }}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete GST Rate</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this GST rate? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRate(rate.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Tax Components</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddComponent(rate.id)}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Add Component
                    </Button>
                  </div>

                  <div className="space-y-3 mt-2">
                    {rate.components.map((component) => (
                      <div key={component.id} className="flex items-end gap-3 bg-muted/40 p-3 rounded-md">
                        <div className="flex-1">
                          <Label className="text-xs">Component Name</Label>
                          <Input
                            className="mt-1"
                            value={component.name}
                            onChange={(e) => handleUpdateComponent(rate.id, component.id, 'name', e.target.value)}
                            placeholder="e.g., CGST, SGST"
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs">Rate (%)</Label>
                          <Input
                            className="mt-1"
                            type="number"
                            value={component.rate}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              handleUpdateComponent(rate.id, component.id, 'rate', value);
                            }}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteComponent(rate.id, component.id)}
                          disabled={rate.components.length <= 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3 mt-2">
                  <span className="font-medium">Total Rate:</span>
                  <span className="text-lg font-semibold">{rate.totalRate}%</span>
                </div>
              </div>
            ))}

            {gstRates.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No GST rates configured</p>
                <p className="text-sm">Add a new rate to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};