import React, { useState } from 'react';
import { Save, Plus, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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

interface GSTRate {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

export const GSTSettings: React.FC = () => {
  const { toast } = useToast();
  const [gstRates, setGstRates] = useState<GSTRate[]>([
    { id: '1', name: 'Standard GST', rate: 7.5, isActive: true },
    { id: '2', name: 'Reduced GST', rate: 5, isActive: false },
  ]);

  const handleAddRate = () => {
    const newRate: GSTRate = {
      id: Date.now().toString(),
      name: 'New GST Rate',
      rate: 0,
      isActive: false,
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

  const handleUpdateRate = (id: string, field: keyof GSTRate, value: string | number | boolean) => {
    setGstRates(gstRates.map(rate => 
      rate.id === id ? { ...rate, [field]: value } : rate
    ));
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
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label>Rate Name</Label>
                    <Input
                      value={rate.name}
                      onChange={(e) => handleUpdateRate(rate.id, 'name', e.target.value)}
                      placeholder="Enter rate name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Rate Percentage (%)</Label>
                    <Input
                      type="number"
                      value={rate.rate}
                      onChange={(e) => handleUpdateRate(rate.id, 'rate', parseFloat(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rate.isActive}
                      onCheckedChange={(checked) => handleUpdateRate(rate.id, 'isActive', checked)}
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