import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`p-6 rounded-2xl shadow-md flex items-center space-x-4 ${color}`}>
      <div className="p-4 bg-white rounded-full shadow">
        <Icon className="text-3xl text-green-700" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
