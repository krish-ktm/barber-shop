import React from 'react';
import { 
  Line, 
  LineChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils';

export interface ComparisonDataPoint {
  date: string;
  current: number;
  previous?: number;
}

interface ComparisonChartProps {
  data: ComparisonDataPoint[];
  title: string;
  className?: string;
  showLegend?: boolean;
  currentLabel?: string;
  previousLabel?: string;
  yAxisFormatter?: (value: number) => string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  title,
  className,
  showLegend = true,
  currentLabel = "Current Period",
  previousLabel = "Previous Period",
  yAxisFormatter = (value) => formatCurrency(Number(value))
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={yAxisFormatter} 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value, name) => {
                return [yAxisFormatter(Number(value)), name === "current" ? currentLabel : previousLabel];
              }}
              labelFormatter={(date) => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              }}
            />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="current" 
              name={currentLabel}
              stroke="#000000" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="previous" 
              name={previousLabel}
              stroke="#888888" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}; 