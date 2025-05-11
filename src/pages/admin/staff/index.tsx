import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaffManagement() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
          <CardDescription>Manage your barbershop staff members</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Staff management content will go here */}
          <p className="text-muted-foreground">Staff management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}