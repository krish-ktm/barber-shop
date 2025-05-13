import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  Mail,
  MessageSquare,
  Save,
  Settings as SettingsIcon,
  Smartphone,
  User,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const Settings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // General Settings
  const [businessName, setBusinessName] = useState('Modern Cuts Barber Shop');
  const [address, setAddress] = useState('123 Main Street, City, State 12345');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [email, setEmail] = useState('contact@moderncuts.com');
  const [website, setWebsite] = useState('www.moderncuts.com');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState({
    appointments: true,
    reminders: true,
    marketing: false,
    reports: true,
  });

  const [smsNotifications, setSmsNotifications] = useState({
    appointments: true,
    reminders: true,
    marketing: false,
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    allowWalkIns: true,
    requireDeposit: false,
    depositAmount: 10,
    minAdvanceTime: 2, // hours
    maxAdvanceTime: 30, // days
    allowCancellation: true,
    cancellationPeriod: 24, // hours
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptMobile: true,
    autoTip: true,
    defaultTip: 15,
    taxRate: 7.5,
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your barber shop settings and preferences"
        action={{
          label: "Save Changes",
          onClick: handleSave,
          icon: <Save className="h-4 w-4 mr-2" />,
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="booking">
            <User className="h-4 w-4 mr-2" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-4">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Confirmations</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails for new and updated appointments
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications.appointments}
                      onCheckedChange={(checked) =>
                        setEmailNotifications({ ...emailNotifications, appointments: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send reminder emails to customers
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications.reminders}
                      onCheckedChange={(checked) =>
                        setEmailNotifications({ ...emailNotifications, reminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Send promotional offers and updates
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications.marketing}
                      onCheckedChange={(checked) =>
                        setEmailNotifications({ ...emailNotifications, marketing: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reports & Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily/weekly business reports
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications.reports}
                      onCheckedChange={(checked) =>
                        setEmailNotifications({ ...emailNotifications, reports: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS for new and updated appointments
                      </p>
                    </div>
                    <Switch
                      checked={smsNotifications.appointments}
                      onCheckedChange={(checked) =>
                        setSmsNotifications({ ...smsNotifications, appointments: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Customer Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send SMS reminders to customers
                      </p>
                    </div>
                    <Switch
                      checked={smsNotifications.reminders}
                      onCheckedChange={(checked) =>
                        setSmsNotifications({ ...smsNotifications, reminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Send promotional SMS to customers
                      </p>
                    </div>
                    <Switch
                      checked={smsNotifications.marketing}
                      onCheckedChange={(checked) =>
                        setSmsNotifications({ ...smsNotifications, marketing: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <Card>
              <CardHeader>
                <CardTitle>Booking Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Walk-ins</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable walk-in appointments
                      </p>
                    </div>
                    <Switch
                      checked={bookingSettings.allowWalkIns}
                      onCheckedChange={(checked) =>
                        setBookingSettings({ ...bookingSettings, allowWalkIns: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Deposit</Label>
                      <p className="text-sm text-muted-foreground">
                        Require deposit for bookings
                      </p>
                    </div>
                    <Switch
                      checked={bookingSettings.requireDeposit}
                      onCheckedChange={(checked) =>
                        setBookingSettings({ ...bookingSettings, requireDeposit: checked })
                      }
                    />
                  </div>

                  {bookingSettings.requireDeposit && (
                    <div className="grid gap-2">
                      <Label>Deposit Amount ($)</Label>
                      <Input
                        type="number"
                        value={bookingSettings.depositAmount}
                        onChange={(e) =>
                          setBookingSettings({
                            ...bookingSettings,
                            depositAmount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label>Minimum Advance Booking (hours)</Label>
                    <Input
                      type="number"
                      value={bookingSettings.minAdvanceTime}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          minAdvanceTime: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Maximum Advance Booking (days)</Label>
                    <Input
                      type="number"
                      value={bookingSettings.maxAdvanceTime}
                      onChange={(e) =>
                        setBookingSettings({
                          ...bookingSettings,
                          maxAdvanceTime: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Cancellation</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to cancel bookings
                      </p>
                    </div>
                    <Switch
                      checked={bookingSettings.allowCancellation}
                      onCheckedChange={(checked) =>
                        setBookingSettings({ ...bookingSettings, allowCancellation: checked })
                      }
                    />
                  </div>

                  {bookingSettings.allowCancellation && (
                    <div className="grid gap-2">
                      <Label>Cancellation Period (hours)</Label>
                      <Input
                        type="number"
                        value={bookingSettings.cancellationPeriod}
                        onChange={(e) =>
                          setBookingSettings({
                            ...bookingSettings,
                            cancellationPeriod: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accept Cash</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow cash payments
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.acceptCash}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({ ...paymentSettings, acceptCash: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accept Card</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow card payments
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.acceptCard}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({ ...paymentSettings, acceptCard: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Accept Mobile Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow mobile payment methods
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.acceptMobile}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({ ...paymentSettings, acceptMobile: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Tip Suggestion</Label>
                      <p className="text-sm text-muted-foreground">
                        Show tip suggestions during payment
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.autoTip}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({ ...paymentSettings, autoTip: checked })
                      }
                    />
                  </div>

                  {paymentSettings.autoTip && (
                    <div className="grid gap-2">
                      <Label>Default Tip Percentage</Label>
                      <Input
                        type="number"
                        value={paymentSettings.defaultTip}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            defaultTip: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={paymentSettings.taxRate}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          taxRate: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-medium">Version</h4>
                      <p className="text-sm text-muted-foreground">Current system version</p>
                    </div>
                    <span className="text-sm">1.0.0</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-medium">Last Updated</h4>
                      <p className="text-sm text-muted-foreground">Latest system update</p>
                    </div>
                    <span className="text-sm">{format(new Date(), 'MMM d, yyyy')}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-medium">Database Size</h4>
                      <p className="text-sm text-muted-foreground">Current storage usage</p>
                    </div>
                    <span className="text-sm">24.5 MB</span>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Check for Updates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@barbershop.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Live Chat Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Knowledge Base</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};