import React, { useState } from 'react';
import Footer from '../components/Footer';
import NavigationBar from '../components/navigationBar';
import { Link } from 'react-router-dom';
import { FaHome, FaWarehouse, FaUsers, FaTruck, FaLeaf } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import DashboardCard from '../components/DashboardCard';
const initialRecords = [
  { id: 'PROD-20240726-001', date: '2024-07-26', time: '09:00', quantity: 1000 },
  { id: 'PROD-20240725-002', date: '2024-07-25', time: '14:30', quantity: 1500 },
  { id: 'PROD-20240724-003', date: '2024-07-24', time: '11:15', quantity: 800 },
  { id: 'PROD-20240723-004', date: '2024-07-23', time: '16:45', quantity: 1200 },
  { id: 'PROD-20240722-005', date: '2024-07-22', time: '10:00', quantity: 500 },
];

const Production = () => {
  const [availableLeaves, setAvailableLeaves] = useState(5000);
  const [quantity, setQuantity] = useState('');
  const [records, setRecords] = useState(initialRecords);

  const handleSendToProduction = () => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0 || qty > availableLeaves) return;
    const newRecord = {
      id: `PROD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-00${records.length+1}`,
      date: new Date().toISOString().slice(0,10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quantity: qty,
    };
    setRecords([newRecord, ...records]);
    setAvailableLeaves(availableLeaves - qty);
    setQuantity('');
  };

  return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavigationBar />
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="bg-gray-800 text-white w-64 h-screen p-6 space-y-4 sticky top-0">
            <Link to="/" className="px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium flex items-center">
              <FaHome className="mr-3" /> Home
            </Link>
            <Link to="/ProductionManagerDashboard" className="px-4 py-2 rounded hover:bg-gray-700  text-sm font-medium flex items-center">
              <MdDashboardCustomize className="mr-3" /> Dashboard
            </Link>
            <Link to="/inventories" className="px-4 py-2 rounded hover:bg-gray-700 bg-opacity-40 text-sm font-medium flex items-center">
              <FaWarehouse className="mr-3" /> Inventory
            </Link>
            <Link to="/SupplierHome" className="px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium flex items-center">
              <FaUsers className="mr-3" /> Supplier
            </Link>
            <Link to="/production" className="px-4 py-2 rounded bg-green-700 text-sm font-medium flex items-center">
              <FaTruck className="mr-3" /> Production
            </Link>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            <h1 className="text-3xl font-bold mb-8">Production</h1>
            <section className="mb-8">
              <div className="mb-6 flex flex-row gap-6">
                <div className="max-w-xs w-full">
                  <DashboardCard
                    title="Available Raw Tea Leaves"
                    value={`${availableLeaves} kg`}
                    icon={FaLeaf}
                    color="bg-green-100"
                  />
                </div>
                <div className="max-w-xs w-full flex flex-col justify-center">
                  <label className="block mb-1 font-medium">Quantity to Send for Production (kg)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="1"
                    max={availableLeaves}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition w-full"
                    onClick={handleSendToProduction}
                    disabled={!quantity || parseInt(quantity) <= 0 || parseInt(quantity) > availableLeaves}
                  >
                    Send to Production
                  </button>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">Production Records</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-8">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>No</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Production ID</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Date</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Time</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-black'>Quantity (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record.id} className="border-t">
                        <td className="px-6 py-3">{index + 1}</td>
                        <td className="px-6 py-3">{record.id}</td>
                        <td className="px-6 py-3">{record.date}</td>
                        <td className="px-6 py-3">{record.time}</td>
                        <td className="px-6 py-3">{record.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
        <Footer />
      </div>
    );
};

export default Production;
