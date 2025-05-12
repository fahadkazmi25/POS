"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "9AM",
    total: 120,
  },
  {
    name: "10AM",
    total: 240,
  },
  {
    name: "11AM",
    total: 300,
  },
  {
    name: "12PM",
    total: 380,
  },
  {
    name: "1PM",
    total: 220,
  },
  {
    name: "2PM",
    total: 280,
  },
  {
    name: "3PM",
    total: 250,
  },
  {
    name: "4PM",
    total: 350,
  },
  {
    name: "5PM",
    total: 400,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip formatter={(value: number) => [`$${value}`, "Sales"]} labelFormatter={(label) => `Time: ${label}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
