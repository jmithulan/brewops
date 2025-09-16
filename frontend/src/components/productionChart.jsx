import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', production: 120 },
  { month: 'Feb', production: 150 },
  { month: 'Mar', production: 170 },
  { month: 'Apr', production: 160 },
  { month: 'May', production: 200 },
];

const ProductionChart = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Monthly Production (kg)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="production" stroke="#16a34a" strokeWidth={3} />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionChart;
