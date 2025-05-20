import React, { useState } from 'react';
import { Save, Plus, Trash, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { gstRatesData } from '@/mocks';
import { GSTRate, GSTComponent } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export const GSTSettings: React.FC = () => {
  const { toast } = useToast();
  const [gstRates, setGstRates] = useState<GSTRate[]>(gstRatesData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<GSTRate | null>(null);
  const [newRate, setNewRate] = useState<Partial<GSTRate>>({
    name: '',
    components: [{ id: `comp-${Date.now()}`, name: 'GST', rate: 0 }],
    isActive: false,
  });

  // Function to calculate total rate from components
  const calculateTotalRate = (components: GSTComponent[]): number => {
    return parseFloat(
      components.reduce((sum, comp) => sum + comp.rate, 0).toFixed(2)
    );
  };

  const handleAddRate = () => {
    const rate: GSTRate = {
      id: Date.now().toString(),
      name: newRate.name || 'New GST Rate',
      components: newRate.components || [{ id: `comp-${Date.now()}`, name: 'GST', rate: 0 }],
      isActive: newRate.isActive || false,
      totalRate: calculateTotalRate(newRate.components || []),
    };

    setGstRates([...gstRates, rate]);
    setNewRate({
      name: '',
      components: [{ id: `comp-${Date.now()}`, name: 'GST', rate: 0 }],
      isActive: false,
    });
    setIsAddDialogOpen(false);
    toast({
      title: 'GST rate added',
      description: 'The new GST rate has been added successfully.',
    });
  };

  const handleEditRate = () => {
    if (!selectedRate) return;

    const updatedRates = gstRates.map(rate => {
      if (rate.id === selectedRate.id) {
        const updatedRate = {
          ...selectedRate,
          totalRate: calculateTotalRate(selectedRate.components),
        };
        return updatedRate;
      }
      return rate;
    });

    setGstRates(updatedRates);
    setSelectedRate(null);
    setIsEditDialogOpen(false);
    toast({
      title: 'GST rate updated',
      description: 'The GST rate has been updated successfully.',
    });
  };

  const handleDeleteRate = (id: string) => {
    setGstRates(gstRates.filter(rate => rate.id !== id));
    toast({
      title: 'GST rate deleted',
      description: 'The GST rate has been removed successfully.',
    });
  };

  const handleUpdateComponent = (rateId: string, componentId: string, field: keyof GSTComponent, value: string | number) => {
    if (!selectedRate) return;

    const updatedComponents = selectedRate.components.map(comp => 
      comp.id === componentId ? { ...comp, [field]: value } : comp
    );
    
    setSelectedRate({
      ...selectedRate,
      components: updatedComponents,
    });
  };

  const handleAddComponent = () => {
    if (!selectedRate) return;

    const newComponent: GSTComponent = {
      id: `comp-${Date.now()}`,
      name: 'New Component',
      rate: 0
    };

    setSelectedRate({
      ...selectedRate,
      components: [...selectedRate.components, newComponent],
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    if (!selectedRate) return;
    
    if (selectedRate.components.length <= 1) {
      toast({
        title: 'Cannot delete component',
        description: 'A GST rate must have at least one component.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedRate({
      ...selectedRate,
      components: selectedRate.components.filter(comp => comp.id !== componentId),
    });
  };

  const handleSave = () => {
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New GST Rate</DialogTitle>
                  <DialogDescription>
                    Create a new GST rate with its components.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Rate Name</Label>
                    <Input
                      value={newRate.name}
                      onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                      placeholder="Enter rate name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Components</Label>
                    {newRate.components?.map((component, index) => (
                      <div key={component.id} className="flex gap-2">
                        <Input
                          value={component.name}
                          onChange={(e) => {
                            const updatedComponents = [...(newRate.components || [])];
                            updatedComponents[index] = {
                              ...component,
                              name: e.target.value,
                            };
                            setNewRate({ ...newRate, components: updatedComponents });
                          }}
                          placeholder="Component name"
                        />
                        <Input
                          type="number"
                          value={component.rate}
                          onChange={(e) => {
                            const updatedComponents = [...(newRate.components || [])];
                            updatedComponents[index] = {
                              ...component,
                              rate: parseFloat(e.target.value) || 0,
                            };
                            setNewRate({ ...newRate, components: updatedComponents });
                          }}
                          placeholder="Rate %"
                          className="w-24"
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newComponent: GSTComponent = {
                          id: `comp-${Date.now()}`,
                          name: 'New Component',
                          rate: 0,
                        };
                        setNewRate({
                          ...newRate,
                          components: [...(newRate.components || []), newComponent],
                        });
                      }}
                    >
                      Add Component
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newRate.isActive}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGstRates(gstRates.map(rate => ({
                            ...rate,
                            isActive: false
                          })));
                        }
                        setNewRate({ ...newRate, isActive: checked });
                      }}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRate}>Add Rate</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Components</TableHead>
                <TableHead>Total Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gstRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.name}</TableCell>
                  <TableCell>
                    {rate.components.map((comp, index) => (
                      <div key={comp.id} className="text-sm text-muted-foreground">
                        {comp.name}: {comp.rate}%
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{rate.totalRate}%</TableCell>
                  <TableCell>
                    <Badge variant={rate.isActive ? "default" : "secondary"}>
                      {rate.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditDialogOpen && selectedRate?.id === rate.id} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRate(rate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit GST Rate</DialogTitle>
                          <DialogDescription>
                            Modify the GST rate and its components.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Rate Name</Label>
                            <Input
                              value={selectedRate?.name}
                              onChange={(e) => setSelectedRate(selectedRate ? {
                                ...selectedRate,
                                name: e.target.value,
                              } : null)}
                              placeholder="Enter rate name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Components</Label>
                            {selectedRate?.components.map((component) => (
                              <div key={component.id} className="flex gap-2">
                                <Input
                                  value={component.name}
                                  onChange={(e) => handleUpdateComponent(
                                    rate.id,
                                    component.id,
                                    'name',
                                    e.target.value
                                  )}
                                  placeholder="Component name"
                                />
                                <Input
                                  type="number"
                                  value={component.rate}
                                  onChange={(e) => handleUpdateComponent(
                                    rate.id,
                                    component.id,
                                    'rate',
                                    parseFloat(e.target.value) || 0
                                  )}
                                  placeholder="Rate %"
                                  className="w-24"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteComponent(component.id)}
                                  disabled={selectedRate.components.length <= 1}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddComponent}
                            >
                              Add Component
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={selectedRate?.isActive}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setGstRates(gstRates.map(r => ({
                                    ...r,
                                    isActive: r.id === rate.id
                                  })));
                                }
                                setSelectedRate(selectedRate ? {
                                  ...selectedRate,
                                  isActive: checked,
                                } : null);
                              }}
                            />
                            <Label>Active</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditRate}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
                  </TableCell>
                </TableRow>
              ))}
              {gstRates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    <p>No GST rates configured</p>
                    <p className="text-sm">Add a new rate to get started</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};