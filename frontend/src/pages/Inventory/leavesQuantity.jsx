import React, { useState, useEffect } from 'react';

const LeavesQuantity = () => {
  const [leavesData, setLeavesData] = useState([
    { id: 1, quality: 'Premium Grade', quantity: 150.5, unit: 'kg', date: '2025-09-11' },
    { id: 2, quality: 'First Grade', quantity: 200.0, unit: 'kg', date: '2025-09-11' },
    { id: 3, quality: 'Second Grade', quantity: 175.3, unit: 'kg', date: '2025-09-10' },
    { id: 4, quality: 'Third Grade', quantity: 120.8, unit: 'kg', date: '2025-09-10' }
  ]);

  const [newLeaf, setNewLeaf] = useState({
    quality: '',
    quantity: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddLeaf = (e) => {
    e.preventDefault();
    const leaf = {
      id: leavesData.length + 1,
      ...newLeaf,
      quantity: parseFloat(newLeaf.quantity)
    };
    setLeavesData([...leavesData, leaf]);
    setNewLeaf({ quality: '', quantity: '', unit: 'kg', date: new Date().toISOString().split('T')[0] });
  };

  const totalQuantity = leavesData.reduce((sum, leaf) => sum + leaf.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tea Leaves Quantity Management</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Quantity</h3>
              <p className="text-2xl font-bold text-blue-700">{totalQuantity.toFixed(1)} kg</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Quality Grades</h3>
              <p className="text-2xl font-bold text-green-700">{leavesData.length}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Average per Grade</h3>
              <p className="text-2xl font-bold text-yellow-700">{(totalQuantity / leavesData.length).toFixed(1)} kg</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Entry</h2>
              <form onSubmit={handleAddLeaf} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
                  <select
                    value={newLeaf.quality}
                    onChange={(e) => setNewLeaf({...newLeaf, quality: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Quality</option>
                    <option value="Premium Grade">Premium Grade</option>
                    <option value="First Grade">First Grade</option>
                    <option value="Second Grade">Second Grade</option>
                    <option value="Third Grade">Third Grade</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLeaf.quantity}
                    onChange={(e) => setNewLeaf({...newLeaf, quantity: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={newLeaf.unit}
                    onChange={(e) => setNewLeaf({...newLeaf, unit: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lbs">Pounds (lbs)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newLeaf.date}
                    onChange={(e) => setNewLeaf({...newLeaf, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Add Entry
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Inventory</h2>
              <div className="space-y-3">
                {leavesData.map((leaf) => (
                  <div key={leaf.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{leaf.quality}</h3>
                        <p className="text-sm text-gray-600">Date: {leaf.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{leaf.quantity} {leaf.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavesQuantity;







