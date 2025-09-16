import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Supplier A", leaves: 1200 },
  { name: "Supplier B", leaves: 800 },
  { name: "Supplier C", leaves: 600 },
  { name: "Supplier D", leaves: 400 },
];

const SupplierChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        Raw Leaves Received by Supplier
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: "kg", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="leaves" fill="#4CAF50" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupplierChart;
