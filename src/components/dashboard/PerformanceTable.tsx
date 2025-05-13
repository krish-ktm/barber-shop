import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ServicePerformance, StaffPerformance } from '@/types';
import { formatCurrency } from '@/utils';

interface PerformanceTableProps {
  data: ServicePerformance[] | StaffPerformance[];
  title: string;
  type: 'service' | 'staff';
  className?: string;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  data,
  title,
  type,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{type === 'service' ? 'Service' : 'Staff'}</TableHead>
              <TableHead className="text-right">
                {type === 'service' ? 'Bookings' : 'Appointments'}
              </TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              {type === 'staff' && (
                <TableHead className="text-right">Commission</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {type === 'service' 
                    ? (item as ServicePerformance).bookings
                    : (item as StaffPerformance).appointments}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.revenue)}
                </TableCell>
                {type === 'staff' && (
                  <TableCell className="text-right">
                    {formatCurrency((item as StaffPerformance).commissionEarned)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};