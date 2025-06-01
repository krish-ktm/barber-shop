import React, { useState } from 'react';
import { Clock, Plus, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { businessHoursData } from '@/mocks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const DAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

const SLOT_DURATIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
];

export const Slots: React.FC = () => {
  const { toast } = useToast();
  const [openingTime, setOpeningTime] = useState(businessHoursData.openingTime);
  const [closingTime, setClosingTime] = useState(businessHoursData.closingTime);
  const [slotDuration, setSlotDuration] = useState(businessHoursData.slotDuration.toString());
  const [breaks, setBreaks] = useState(businessHoursData.breaks);
  const [daysOff, setDaysOff] = useState<string[]>(
    businessHoursData.daysOff.map(day => day.toString())
  );
  // State to control the visibility of the breaks section
  const [showBreaksSection] = useState(false);

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Slot configuration has been updated successfully.',
    });
  };

  const handleAddBreak = () => {
    setBreaks([
      ...breaks,
      {
        name: `Break ${breaks.length + 1}`,
        start: '12:00',
        end: '13:00',
      },
    ]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleBreakChange = (
    index: number,
    field: 'name' | 'start' | 'end',
    value: string
  ) => {
    setBreaks(
      breaks.map((breakItem, i) =>
        i === index ? { ...breakItem, [field]: value } : breakItem
      )
    );
  };

  const handleDayOffToggle = (day: string) => {
    setDaysOff(
      daysOff.includes(day)
        ? daysOff.filter(d => d !== day)
        : [...daysOff, day]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Slot Configuration"
        description="Configure business hours and appointment slots"
        action={{
          label: "Save Changes",
          onClick: handleSave,
          icon: <Save className="h-4 w-4 mr-2" />,
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Opening Time</Label>
                <Input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Closing Time</Label>
                <Input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Slot Duration</Label>
                <Select value={slotDuration} onValueChange={setSlotDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOT_DURATIONS.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Days Off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day.value} className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {day.label}
                  </Label>
                  <Switch
                    checked={daysOff.includes(day.value)}
                    onCheckedChange={() => handleDayOffToggle(day.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Breaks section - hidden with display logic but not removed */}
        {showBreaksSection && (
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Breaks</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddBreak}>
                <Plus className="h-4 w-4 mr-2" />
                Add Break
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breaks.map((breakItem, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="grid gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label className="mb-2">Break Name</Label>
                          <Input
                            value={breakItem.name}
                            onChange={(e) =>
                              handleBreakChange(index, 'name', e.target.value)
                            }
                            placeholder="Enter break name"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="self-end"
                          onClick={() => handleRemoveBreak(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2">Start Time</Label>
                          <Input
                            type="time"
                            value={breakItem.start}
                            onChange={(e) =>
                              handleBreakChange(index, 'start', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label className="mb-2">End Time</Label>
                          <Input
                            type="time"
                            value={breakItem.end}
                            onChange={(e) =>
                              handleBreakChange(index, 'end', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {breaks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No breaks configured</p>
                    <p className="text-sm">Add breaks like lunch time or cleaning periods</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};