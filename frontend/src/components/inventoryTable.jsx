import React from 'react';

const inventoryData = [
  { id: 1, item: 'Green Tea Leaves', stock: 1200, unit: 'kg' },
  { id: 2, item: 'Black Tea Leaves', stock: 800, unit: 'kg' },
  { id: 3, item: 'Packaging Bags', stock: 5000, unit: 'pcs' },
];

const InventoryTable = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Inventory Stock</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-3">Item</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Unit</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="p-3">{item.item}</td>
              <td className="p-3">{item.stock}</td>
              <td className="p-3">{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
