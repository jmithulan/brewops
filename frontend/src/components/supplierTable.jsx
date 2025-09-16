import React from 'react';

const suppliers = [
  { name: 'Supplier A', quantity: '1,200 kg', lastDelivery: '2025-08-08' },
  { name: 'Supplier B', quantity: '800 kg', lastDelivery: '2025-08-07' },
  { name: 'Supplier C', quantity: '600 kg', lastDelivery: '2025-08-06' },
  { name: 'Supplier D', quantity: '400 kg', lastDelivery: '2025-08-05' },
];

const SupplierTable = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Supplier Deliveries</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b py-2">Supplier</th>
            <th className="border-b py-2">Quantity</th>
            <th className="border-b py-2">Last Delivery</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2">{supplier.name}</td>
              <td className="py-2">{supplier.quantity}</td>
              <td className="py-2">{supplier.lastDelivery}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;
