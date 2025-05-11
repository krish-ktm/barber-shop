"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dummy data
const data = [
  { name: "Mon", revenue: 850 },
  { name: "Tue", revenue: 920 },
  { name: "Wed", revenue: 1100 },
  { name: "Thu", revenue: 980 },
  { name: "Fri", revenue: 1250 },
  { name: "Sat", revenue: 1500 },
  { name: "Sun", revenue: 0 },
]

export function AdminDashboardChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${value}`} domain={[0, "dataMax + 200"]} />
          <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} labelFormatter={(label) => `${label}`} />
          <Bar dataKey="revenue" fill="#000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
